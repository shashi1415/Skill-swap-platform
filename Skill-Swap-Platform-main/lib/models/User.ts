import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  location: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  profilePhoto?: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserResponse {
  id: string
  name: string
  email: string
  location: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  profilePhoto?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export function userToResponse(user: User): UserResponse {
  return {
    id: user._id!.toString(),
    name: user.name,
    email: user.email,
    location: user.location,
    skillsOffered: user.skillsOffered,
    skillsWanted: user.skillsWanted,
    availability: user.availability,
    profilePhoto: user.profilePhoto,
    isPublic: user.isPublic,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
