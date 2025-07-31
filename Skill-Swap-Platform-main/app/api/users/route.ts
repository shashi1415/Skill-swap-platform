import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { type User, userToResponse } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const availability = searchParams.get("availability") || "all"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "6")
    const skip = (page - 1) * limit

    // Get current user to exclude them from results
    const userPayload = await getUserFromRequest(request)
    const currentUserId = userPayload?.userId

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Build query
    const query: any = {
      isPublic: true,
    }

    // Exclude current user
    if (currentUserId) {
      query._id = { $ne: new ObjectId(currentUserId) }
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { skillsOffered: { $elemMatch: { $regex: search, $options: "i" } } },
        { skillsWanted: { $elemMatch: { $regex: search, $options: "i" } } },
      ]
    }

    // Availability filter
    if (availability !== "all") {
      query.availability = { $regex: availability, $options: "i" }
    }

    // Get total count for pagination
    const total = await usersCollection.countDocuments(query)

    // Get users
    const users = await usersCollection.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).toArray()

    const userResponses = users.map(userToResponse)

    return NextResponse.json({
      users: userResponses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
