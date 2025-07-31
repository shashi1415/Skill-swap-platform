import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import { type User, userToResponse } from "@/lib/models/User"
import { ObjectId } from "mongodb"
import { IncomingForm } from "formidable"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { readFile } from "fs/promises"



// Helper to parse form data
async function parseForm(req: Request): Promise<{
  fields: Record<string, any>
  file?: File
}> {
  const formData = await req.formData()

  const fields: Record<string, any> = {}
  let file: File | undefined

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      file = value
    } else {
      fields[key] = value
    }
  }

  return { fields, file }
}

export async function GET(request: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne({ _id: new ObjectId(userPayload.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: userToResponse(user),
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userPayload = await getUserFromRequest(req)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const { fields, file } = await parseForm(req)

    const {
      name,
      location,
      availability,
      isPublic,
      skillsOffered,
      skillsWanted,
    } = fields

    let profilePhotoUrl = undefined

    if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), "public/uploads")
      await mkdir(uploadDir, { recursive: true })

      const fileName = `${Date.now()}-${file.name}`
      const filePath = path.join(uploadDir, fileName)

      await writeFile(filePath, buffer)
      profilePhotoUrl = `/uploads/${fileName}`
    }

    const updateDoc: Partial<User> = {
      name,
      location,
      availability,
      isPublic: isPublic === "true",
      skillsOffered: JSON.parse(skillsOffered || "[]"),
      skillsWanted: JSON.parse(skillsWanted || "[]"),
      updatedAt: new Date(),
    }

    if (profilePhotoUrl) {
      updateDoc.profilePhoto = profilePhotoUrl
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(userPayload.userId) },
      { $set: updateDoc }
    )

    const updatedUser = await usersCollection.findOne({ _id: new ObjectId(userPayload.userId) })

    return NextResponse.json({
      user: userToResponse(updatedUser!),
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
