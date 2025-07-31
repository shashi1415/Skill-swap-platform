"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Clock, CheckCircle, XCircle, ArrowRight, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"


interface SwapRequest {
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
  type: "sent" | "received"
}

// Mock swap requests data
// const mockSwapRequests: SwapRequest[] = [
//   {
//     id: "1",
//     senderId: "1",
//     receiverId: "2",
//     senderName: "Alice Johnson",
//     receiverName: "Bob Smith",
//     offeredSkill: "React",
//     wantedSkill: "Python",
//     message:
//       "Hi Bob! I'd love to learn Python from you while teaching you React. I have 3 years of experience with React.",
//     status: "pending",
//     createdAt: "2024-01-15T10:00:00Z",
//     type: "sent",
//   },
//   {
//     id: "2",
//     senderId: "3",
//     receiverId: "1",
//     senderName: "Carol Davis",
//     receiverName: "Alice Johnson",
//     offeredSkill: "UI/UX Design",
//     wantedSkill: "JavaScript",
//     message: "Hello! I'm a UX designer looking to learn JavaScript. Would love to exchange skills!",
//     status: "pending",
//     createdAt: "2024-01-14T15:30:00Z",
//     type: "received",
//   },
//   {
//     id: "3",
//     senderId: "2",
//     receiverId: "1",
//     senderName: "Bob Smith",
//     receiverName: "Alice Johnson",
//     offeredSkill: "Data Science",
//     wantedSkill: "Node.js",
//     message: "Hi Alice! I saw your Node.js skills and would love to learn. I can teach you data science in return.",
//     status: "accepted",
//     createdAt: "2024-01-10T09:15:00Z",
//     type: "received",
//   },
// ]

export default function RequestsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<SwapRequest[]>([])
  const [activeTab, setActiveTab] = useState("received")
  const [filterStatus, setFilterStatus] = useState("all")


  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/swap-requests", {
          credentials: "include", // ✅ Sends cookie to backend
        })

        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests)
        } else {
          console.error("Failed to fetch requests")
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
      }
    }

    fetchRequests()
  }, [user])

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/swap-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ Important addition
        body: JSON.stringify({ status: "accepted" }),
      })


      if (response.ok) {
        setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "accepted" } : req)))
        toast({
          title: "Request accepted",
          description: "You've accepted the swap request. You can now coordinate with your partner!",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to accept request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
  const confirmed = window.confirm("Are you sure you want to delete this swap request?")
  if (!confirmed) return
  try {
    const res = await fetch(`/api/swap-requests/${requestId}`, {
      method: "DELETE",
      credentials: "include",
    })

    if (res.ok) {
      setRequests((prev) => prev.filter((req) => req.id !== requestId))
      toast({
        title: "Deleted",
        description: "Swap request deleted successfully.",
      })
    } else {
      const data = await res.json()
      toast({
        title: "Error",
        description: data.error || "Could not delete request.",
        variant: "destructive",
      })
    }
  } catch (err) {
    toast({
      title: "Error",
      description: "Something went wrong while deleting.",
      variant: "destructive",
    })
  }
}


  const handleRejectRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/swap-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Remove the Authorization header completely
            credentials: "include",

        },
        body: JSON.stringify({ status: "rejected" }),
      })

      if (response.ok) {
        setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" } : req)))
        toast({
          title: "Request rejected",
          description: "The swap request has been declined.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to reject request.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

  const receivedRequests = requests.filter(
    (req) => req.type === "received" && (filterStatus === "all" || req.status === filterStatus)
  )

  const sentRequests = requests.filter(
    (req) => req.type === "sent" && (filterStatus === "all" || req.status === filterStatus)
  )


  const pendingReceived = receivedRequests.filter((req) => req.status === "pending")
  const acceptedReceived = receivedRequests.filter((req) => req.status === "accepted")
  const rejectedReceived = receivedRequests.filter((req) => req.status === "rejected")

  const pendingSent = sentRequests.filter((req) => req.status === "pending")
  const acceptedSent = sentRequests.filter((req) => req.status === "accepted")
  const rejectedSent = sentRequests.filter((req) => req.status === "rejected")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Swap Requests</h1>
          <p className="text-gray-600">Manage your incoming and outgoing skill exchange requests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              Received Requests
              {pendingReceived.length > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">
                  {pendingReceived.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2">
              Sent Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-6">

              <div className="flex items-center justify-end">
  <div className="w-48">
    <Label className="text-sm mb-1">Filter by Status</Label>
    <Select
      value={filterStatus}
      onValueChange={(value) => setFilterStatus(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="accepted">Accepted</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

            
            {/* Pending Requests */}
            {pendingReceived.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Pending Requests ({pendingReceived.length})
                </h3>
                <div className="grid gap-4">
                  {pendingReceived.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.senderPhoto || "/placeholder.svg"} alt={request.senderName} />
                              <AvatarFallback>
                                {request.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{request.senderName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>

                        {request.message && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800">{request.message}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id)}>
    Delete
  </Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                            Decline
                          </Button>
                          <Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
                            Accept
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Requests */}
            {acceptedReceived.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Accepted Requests ({acceptedReceived.length})
                </h3>
                <div className="grid gap-4">
                  {acceptedReceived.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-green-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.senderPhoto || "/placeholder.svg"} alt={request.senderName} />
                              <AvatarFallback>
                                {request.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{request.senderName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-center space-x-4 p-3 bg-green-50 rounded-lg">
                          <Badge variant="default">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-green-600" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 Great! You can now coordinate with {request.senderName} to start your skill exchange.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Requests */}
            {rejectedReceived.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Declined Requests ({rejectedReceived.length})
                </h3>
                <div className="grid gap-4">
                  {rejectedReceived.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-red-400 opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.senderPhoto || "/placeholder.svg"} alt={request.senderName} />
                              <AvatarFallback>
                                {request.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{request.senderName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="secondary">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {receivedRequests.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600">When others send you swap requests, they'll appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <div className="flex items-center justify-end">
  <div className="w-48">
    <Label className="text-sm mb-1">Filter by Status</Label>
    <Select
      value={filterStatus}
      onValueChange={(value) => setFilterStatus(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="accepted">Accepted</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  </div>
</div>

            {/* Pending Sent Requests */}
            {pendingSent.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Pending Requests ({pendingSent.length})
                </h3>
                <div className="grid gap-4">
                  {pendingSent.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-yellow-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={request.receiverPhoto || "/placeholder.svg"}
                                alt={request.receiverName}
                              />
                              <AvatarFallback>
                                {request.receiverName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">To: {request.receiverName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="default">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>

                        {request.message && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800">{request.message}</p>
                            </div>
                          </div>
                        )}

                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⏳ Waiting for {request.receiverName} to respond to your request.
                          </p>
                        </div>

                        <div className="flex justify-end mt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
                          </Button>
                        </div>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Sent Requests */}
            {acceptedSent.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Accepted Requests ({acceptedSent.length})
                </h3>
                <div className="grid gap-4">
                  {acceptedSent.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-green-400">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={request.receiverPhoto || "/placeholder.svg"}
                                alt={request.receiverName}
                              />
                              <AvatarFallback>
                                {request.receiverName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">With: {request.receiverName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-center space-x-4 p-3 bg-green-50 rounded-lg">
                          <Badge variant="default">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-green-600" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>

                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800 font-medium">
                            🎉 {request.receiverName} accepted your request! You can now start your skill exchange.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Sent Requests */}
            {rejectedSent.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Declined Requests ({rejectedSent.length})
                </h3>
                <div className="grid gap-4">
                  {rejectedSent.map((request) => (
                    <Card key={request.id} className="border-l-4 border-l-red-400 opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={request.receiverPhoto || "/placeholder.svg"}
                                alt={request.receiverName}
                              />
                              <AvatarFallback>
                                {request.receiverName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">To: {request.receiverName}</CardTitle>
                              <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                            {getStatusIcon(request.status)}
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <Badge variant="secondary">{request.offeredSkill}</Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">{request.wantedSkill}</Badge>
                        </div>
                        
                        

                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {sentRequests.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests sent</h3>
                <p className="text-gray-600 mb-4">Start by browsing profiles and sending swap requests.</p>
                <Button onClick={() => router.push("/")}>Browse Profiles</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
