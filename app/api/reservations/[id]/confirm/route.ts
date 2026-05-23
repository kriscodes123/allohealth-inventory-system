import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const reservationId = parseInt(id);

    const result = await prisma.$transaction(async (tx) => {
      // Find reservation
      const reservation = await tx.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

      // Reservation missing
      if (!reservation) {
        return {
          error: "Reservation not found",
          status: 404,
        };
      }

      // Already expired/released
      if (reservation.status !== "pending") {
        return {
          error: "Reservation cannot be confirmed",
          status: 400,
        };
      }

      // Expired reservation
      if (new Date() > reservation.expiresAt) {
        return {
          error: "Reservation expired",
          status: 410,
        };
      }

      // Find inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
      });

      if (!inventory) {
        return {
          error: "Inventory not found",
          status: 404,
        };
      }

      // Permanently reduce stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          totalStock: {
            decrement: reservation.quantity,
          },
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Mark reservation confirmed
      const updatedReservation = await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "confirmed",
        },
      });

      return {
        reservation: updatedReservation,
        status: 200,
      };
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}