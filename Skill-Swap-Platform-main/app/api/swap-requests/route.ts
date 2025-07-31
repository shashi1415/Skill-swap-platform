import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { SwapRequest, SwapRequestResponse } from "@/lib/models/SwapRequest"
import type { User } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { receiverId, offeredSkill, wantedSkill, message } = body

    // Validate required fields
    if (!receiverId || !offeredSkill || !wantedSkill) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate ObjectId
    if (!ObjectId.isValid(receiverId)) {
      return NextResponse.json({ error: "Invalid receiver ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const swapRequestsCollection = db.collection<SwapRequest>("swapRequests")
    const usersCollection = db.collection<User>("users")

    // Check if receiver exists
    const receiver = await usersCollection.findOne({ _id: new ObjectId(receiverId) })
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 })
    }

    // Check if request already exists
    const existingRequest = await swapRequestsCollection.findOne({
      senderId: new ObjectId(userPayload.userId),
      receiverId: new ObjectId(receiverId),
      status: "pending",
    })

    if (existingRequest) {
      return NextResponse.json({ error: "You already have a pending request with this user" }, { status: 409 })
    }

    // Create swap request
    const newSwapRequest: SwapRequest = {
      senderId: new ObjectId(userPayload.userId),
      receiverId: new ObjectId(receiverId),
      offeredSkill,
      wantedSkill,
      message: message || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await swapRequestsCollection.insertOne(newSwapRequest)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: "Swap request sent successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create swap request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "all" // 'sent', 'received', or 'all'
    const status = searchParams.get("status") || "all" // 'pending', 'accepted', 'rejected', or 'all'

    const db = await getDatabase()
    const swapRequestsCollection = db.collection<SwapRequest>("swapRequests")
    const usersCollection = db.collection<User>("users")

    const userId = new ObjectId(userPayload.userId)

    // Build query
    const query: any = {}

    if (type === "sent") {
      query.senderId = userId
    } else if (type === "received") {
      query.receiverId = userId
    } else {
      query.$or = [{ senderId: userId }, { receiverId: userId }]
    }

    if (status !== "all") {
      query.status = status
    }

    // Get swap requests
    const swapRequests = await swapRequestsCollection.find(query).sort({ createdAt: -1 }).toArray()

    // Get user details for each request
    const userIds = new Set<string>()
    swapRequests.forEach((request) => {
      userIds.add(request.senderId.toString())
      userIds.add(request.receiverId.toString())
    })

    const users = await usersCollection
      .find({ _id: { $in: Array.from(userIds).map((id) => new ObjectId(id)) } })
      .toArray()

    const userMap = new Map(users.map((user) => [user._id!.toString(), user]))

    // Format response
    const formattedRequests: SwapRequestResponse[] = swapRequests.map((request) => {
      const sender = userMap.get(request.senderId.toString())!
      const receiver = userMap.get(request.receiverId.toString())!
      const requestType = request.senderId.toString() === userPayload.userId ? "sent" : "received"

      return {
        id: request._id!.toString(),
        senderId: request.senderId.toString(),
        receiverId: request.receiverId.toString(),
        senderName: sender.name,
        receiverName: receiver.name,
        senderPhoto: sender.profilePhoto,
        receiverPhoto: receiver.profilePhoto,
        offeredSkill: request.offeredSkill,
        wantedSkill: request.wantedSkill,
        message: request.message,
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        type: requestType,
      }
    })

    return NextResponse.json({
      requests: formattedRequests,
    })
  } catch (error) {
    console.error("Get swap requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

