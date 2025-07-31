"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SwapRequestModalProps {
  targetUser: any
  isOpen: boolean
  onClose: () => void
}

export function SwapRequestModal({ targetUser, isOpen, onClose }: SwapRequestModalProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState("")
  const [selectedWantedSkill, setSelectedWantedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOfferedSkill || !selectedWantedSkill) {
      toast({
        title: "Missing information",
        description: "Please select both skills for the exchange.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/swap-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ This line is required to send the auth-token cookie
        body: JSON.stringify({
          receiverId: targetUser.id,
          offeredSkill: selectedOfferedSkill,
          wantedSkill: selectedWantedSkill,
          message,
        }),
      })

      if (response.ok) {
        toast({
          title: "Request sent!",
          description: `Your swap request has been sent to ${targetUser.name}.`,
        })
        onClose()

        // Reset form
        setSelectedOfferedSkill("")
        setSelectedWantedSkill("")
        setMessage("")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to send request. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Send Swap Request</DialogTitle>
          <DialogDescription>Propose a skill exchange with {targetUser.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Target User Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={targetUser.profilePhoto || "/placeholder.svg"} alt={targetUser.name} />
              <AvatarFallback>
                {targetUser.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{targetUser.name}</h3>
              <p className="text-sm text-gray-600">{targetUser.location}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skill Exchange Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>I can offer:</Label>
                <Select value={selectedOfferedSkill} onValueChange={setSelectedOfferedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill you offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.skillsOffered.map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {user.skillsOffered.map((skill) => (
                    <Badge key={skill} variant="default" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>I want to learn:</Label>
                <Select value={selectedWantedSkill} onValueChange={setSelectedWantedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill they offer" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetUser.skillsOffered.map((skill: string) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {targetUser.skillsOffered.map((skill: string) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Exchange Preview */}
            {selectedOfferedSkill && selectedWantedSkill && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center space-x-4">
                  <Badge variant="default">{selectedOfferedSkill}</Badge>
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline">{selectedWantedSkill}</Badge>
                </div>
                <p className="text-center text-sm text-blue-700 mt-2">
                  You'll teach {selectedOfferedSkill} and learn {selectedWantedSkill}
                </p>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to exchange skills..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Request
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
