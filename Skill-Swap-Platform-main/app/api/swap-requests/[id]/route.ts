import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { SwapRequest } from "@/lib/models/SwapRequest"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status } = body

    // Validate request ID
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    // Validate status
    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be "accepted" or "rejected"' }, { status: 400 })
    }

    const db = await getDatabase()
    const swapRequestsCollection = db.collection<SwapRequest>("swapRequests")

    // Find the request
    const swapRequest = await swapRequestsCollection.findOne({ _id: new ObjectId(id) })
    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Check if user is the receiver (only receiver can accept/reject)
    if (swapRequest.receiverId.toString() !== userPayload.userId) {
      return NextResponse.json({ error: "You can only respond to requests sent to you" }, { status: 403 })
    }

    // Check if request is still pending
    if (swapRequest.status !== "pending") {
      return NextResponse.json({ error: "This request has already been responded to" }, { status: 409 })
    }

    // Update the request
    const result = await swapRequestsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
    }

    return NextResponse.json({
      message: `Request ${status} successfully`,
      request: {
        id: result._id!.toString(),
        status: result.status,
        updatedAt: result.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error("Update swap request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestId = params.id
    if (!ObjectId.isValid(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const swapRequests = db.collection("swapRequests")

    const requestDoc = await swapRequests.findOne({ _id: new ObjectId(requestId) })

    if (!requestDoc) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    const isSenderOrReceiver =
      requestDoc.senderId.toString() === userPayload.userId ||
      requestDoc.receiverId.toString() === userPayload.userId

    if (!isSenderOrReceiver) {
      return NextResponse.json({ error: "Unauthorized to delete this request" }, { status: 403 })
    }

    await swapRequests.deleteOne({ _id: new ObjectId(requestId) })

    return NextResponse.json({ message: "Swap request deleted successfully" })
  } catch (error) {
    console.error("Delete request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}