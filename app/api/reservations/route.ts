import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { productId, warehouseId, quantity } = body;

    const result = await prisma.$transaction(async (tx) => {
      // Find inventory row
      const inventory = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
      });

      // Inventory missing
      if (!inventory) {
        return {
          error: "Inventory not found",
          status: 404,
        };
      }

      // Calculate available stock
      const availableStock =
        inventory.totalStock - inventory.reservedStock;

      // Insufficient stock
      if (availableStock < quantity) {
        return {
          error: "Not enough stock available",
          status: 409,
        };
      }

      // Increment reserved stock
      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          reservedStock: {
            increment: quantity,
          },
        },
      });

      // Create reservation
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "pending",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      return {
        reservation,
        status: 200,
      };
    });

    // Handle stock error
    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Success
    return NextResponse.json(result.reservation);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}