import type { ObjectId } from "mongodb"

export interface SwapRequest {
  _id?: ObjectId
  senderId: ObjectId
  receiverId: ObjectId
  offeredSkill: string
  wantedSkill: string
  message: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
  updatedAt: Date
}

export interface SwapRequestResponse {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  receiverName: string
  senderPhoto?: string
  receiverPhoto?: string
  offeredSkill: string
  wantedSkill: string
  message: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
  updatedAt: string
  type: "sent" | "received"
}
