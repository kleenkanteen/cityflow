import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { partOrder, part, batchOrder } from "@/src/db/schema"
import { desc, eq, sql } from "drizzle-orm"
import { CreatePartOrderRequest } from "@/src/types/parts"
import { v4 as uuidv4 } from "uuid"
import { auth } from "@/src/lib/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: CreatePartOrderRequest & { batchOrderId: string } = await request.json()

    const {
      batchOrderId,
      partId,
      quantity,
      requestReason,
      urgencyLevel,
      assetId,
      workOrderNumber,
    } = body

    if (!batchOrderId || !partId || !quantity || !requestReason) {
      return NextResponse.json(
        { error: "Batch order, part, quantity, and request reason are required" },
        { status: 400 }
      )
    }

    // Get part details for pricing
    const partData = await db
      .select()
      .from(part)
      .where(eq(part.id, partId))
      .limit(1)

    if (partData.length === 0) {
      return NextResponse.json(
        { error: "Part not found" },
        { status: 404 }
      )
    }

    const partInfo = partData[0]
    const unitPrice = partInfo.unitPrice || "0.00"
    const totalPrice = (parseFloat(unitPrice) * quantity).toFixed(2)

    const now = new Date()
    const newPartOrder = await db
      .insert(partOrder)
      .values({
        id: uuidv4(),
        batchOrderId,
        partId,
        quantity,
        unitPrice,
        totalPrice,
        requestedBy: session.user.id,
        requestReason,
        urgencyLevel: urgencyLevel || "normal",
        assetId: assetId || null,
        workOrderNumber: workOrderNumber || null,
        receivedQuantity: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    // Update batch order total
    await db
      .update(batchOrder)
      .set({
        totalAmount: sql`${batchOrder.totalAmount} + ${totalPrice}`,
        updatedAt: now,
      })
      .where(eq(batchOrder.id, batchOrderId))

    return NextResponse.json(newPartOrder[0], { status: 201 })
  } catch (error) {
    console.error("Error creating part order:", error)
    return NextResponse.json(
      { error: "Failed to create part order" },
      { status: 500 }
    )
  }
}