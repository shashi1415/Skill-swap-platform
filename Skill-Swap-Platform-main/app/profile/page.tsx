"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, X, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    availability: "",
    isPublic: true,
  })
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")


  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      setFormData({
        name: user.name,
        location: user.location,
        availability: user.availability,
        isPublic: user.isPublic,
      })
      setSkillsOffered(user.skillsOffered)
      setSkillsWanted(user.skillsWanted)
    }
  }, [user, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !skillsOffered.includes(newSkillOffered.trim())) {
      setSkillsOffered((prev) => [...prev, newSkillOffered.trim()])
      setNewSkillOffered("")
    }
  }

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !skillsWanted.includes(newSkillWanted.trim())) {
      setSkillsWanted((prev) => [...prev, newSkillWanted.trim()])
      setNewSkillWanted("")
    }
  }

  const removeSkillOffered = (skill: string) => {
    setSkillsOffered((prev) => prev.filter((s) => s !== skill))
  }

  const removeSkillWanted = (skill: string) => {
    setSkillsWanted((prev) => prev.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsSaving(true)

  try {
    const form = new FormData()
    form.append("name", formData.name)
    form.append("location", formData.location)
    form.append("availability", formData.availability)
    form.append("isPublic", String(formData.isPublic))
    form.append("skillsOffered", JSON.stringify(skillsOffered))
    form.append("skillsWanted", JSON.stringify(skillsWanted))

    if (photoFile) {
      form.append("profilePhoto", photoFile)
    }

    const response = await fetch("/api/auth/me", {
      method: "PUT",
      body: form,
      credentials: "include", // For cookie-based auth
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update profile")
    }

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    })

    // Optionally reload user data
  } catch (error) {
    toast({
      title: "Error",
      description: (error as Error).message || "Failed to update profile",
      variant: "destructive",
    })
  } finally {
    setIsSaving(false)
  }
}


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your profile information and skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
  <Card>
    <CardHeader>
      <CardTitle>Profile Photo</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32">
        <AvatarImage
          src={photoPreview || user.profilePhoto || "/placeholder.svg"}
          alt={user.name}
          className="object-cover"
        />
        <AvatarFallback className="text-2xl">
          {user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center space-y-2">
        {/* Hidden file input */}
        <input
          id="profile-photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              setPhotoFile(file)
              setPhotoPreview(URL.createObjectURL(file))
            }
          }}
        />

        {/* Label as button */}
        <label htmlFor="profile-photo">
          <Button variant="outline" size="sm">
            <Camera className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
        </label>

        <p className="text-xs text-gray-500 text-center">
          Upload a professional photo to help others recognize you
        </p>
      </div>
    </CardContent>
  </Card>



            {/* Profile Visibility */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Profile Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-gray-500">Allow others to find and contact you</p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={formData.availability}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, availability: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekends">Weekends</SelectItem>
                        <SelectItem value="Evenings">Evenings</SelectItem>
                        <SelectItem value="Flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Skills You Can Offer</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newSkillOffered}
                          onChange={(e) => setNewSkillOffered(e.target.value)}
                          placeholder="Add a skill you can teach"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkillOffered())}
                        />
                        <Button type="button" onClick={addSkillOffered}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillsOffered.map((skill) => (
                          <Badge key={skill} variant="default" className="flex items-center gap-1">
                            {skill}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkillOffered(skill)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Skills You Want to Learn</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={newSkillWanted}
                          onChange={(e) => setNewSkillWanted(e.target.value)}
                          placeholder="Add a skill you want to learn"
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkillWanted())}
                        />
                        <Button type="button" onClick={addSkillWanted}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {skillsWanted.map((skill) => (
                          <Badge key={skill} variant="outline" className="flex items-center gap-1">
                            {skill}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkillWanted(skill)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
