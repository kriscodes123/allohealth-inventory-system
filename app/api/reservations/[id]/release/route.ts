import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

      // Missing reservation
      if (!reservation) {
        return {
          error: "Reservation not found",
          status: 404,
        };
      }

      // Only pending reservations can be released
      if (reservation.status !== "pending") {
        return {
          error: "Reservation cannot be released",
          status: 400,
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

      // Release reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            decrement: reservation.quantity,
          },
        },
      });

      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "released",
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
      { error: "Release failed" },
      { status: 500 }
    );
  }
}