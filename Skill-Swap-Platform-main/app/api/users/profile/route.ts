import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { type User, userToResponse } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, location, skillsOffered, skillsWanted, availability, isPublic } = body

    // Validate required fields
    if (!name || !location || !skillsOffered || !skillsWanted || !availability) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Update user
    const updateData = {
      name: name.trim(),
      location: location.trim(),
      skillsOffered: Array.isArray(skillsOffered) ? skillsOffered : [],
      skillsWanted: Array.isArray(skillsWanted) ? skillsWanted : [],
      availability,
      isPublic: isPublic !== false,
      updatedAt: new Date(),
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userPayload.userId) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: userToResponse(result),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
