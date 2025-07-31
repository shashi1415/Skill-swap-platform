import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { User } from "@/lib/models/User"

export async function PUT(request: NextRequest) {
  const userPayload = await getUserFromRequest(request)
  if (!userPayload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, location, skillsOffered, skillsWanted, availability, isPublic } = body

  if (
    !name ||
    !location ||
    !Array.isArray(skillsOffered) ||
    !Array.isArray(skillsWanted) ||
    !availability
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const db = await getDatabase()
  const users = db.collection<User>("users")

  const result = await users.findOneAndUpdate(
    { _id: new ObjectId(userPayload.userId) },
    {
      $set: {
        name,
        location,
        skillsOffered,
        skillsWanted,
        availability,
        isPublic: Boolean(isPublic),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  )

  const updatedUser = result

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      location: updatedUser.location,
      skillsOffered: updatedUser.skillsOffered,
      skillsWanted: updatedUser.skillsWanted,
      availability: updatedUser.availability,
      profilePhoto: updatedUser.profilePhoto,
      isPublic: updatedUser.isPublic,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  })
}
