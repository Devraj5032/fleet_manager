"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Server, Clock, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Rover {
  id: number
  name: string
  identifier: string
  status: string
  last_seen: string | null
  ip_address: string
  metadata: any
  created_at: string
  updated_at: string
  customer_id: number
}

interface ApiResponse {
  success: boolean
  data: Rover[]
}

export interface RoverListProps {
  className?: string
  onSelectRover?: (roverId: number | null) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800"
    case "REGISTERED":
      return "bg-blue-100 text-blue-800"
    case "OFFLINE":
      return "bg-gray-100 text-gray-800"
    case "ERROR":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getTimeAgo = (timestamp: string | null) => {
  if (!timestamp) return "Never connected"
  return formatDistanceToNow(parseISO(timestamp), { addSuffix: true })
}

const RoverList: React.FC<RoverListProps> = ({ className, onSelectRover }) => {
  const [selectedRover, setSelectedRover] = useState<number | null>(null)
  const [rovers, setRovers] = useState<Rover[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [customerFilter, setCustomerFilter] = useState<number | null>(null)

  const fetchRovers = async () => {
    try {
      const res = await axios.get<ApiResponse>("/api/rovers")
      console.log("✅ API Response:", res.data)
      if (res.data.success) {
        setRovers(res.data.data)
      } else {
        throw new Error("Failed to fetch rovers")
      }
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching rovers:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch rovers"))
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchRovers()

    // Set up interval for refetching
    const intervalId = setInterval(() => {
      fetchRovers()
    }, 5000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [])

  // Get unique customer IDs for filtering
  const customerIds = [...new Set(rovers.map((rover) => rover.customer_id))].sort()

  // Filter rovers by customer if a filter is selected
  const filteredRovers = customerFilter ? rovers.filter((rover) => rover.customer_id === customerFilter) : rovers

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rover Details</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="mb-3">
              <Skeleton className="h-24 w-full mb-3" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Rover Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-red-500">Error loading rovers: {error.message}</div>
          <Button onClick={fetchRovers} className="mx-auto block">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rover Details</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filter by Customer:</span>
          <select
            className="text-sm border rounded p-1"
            value={customerFilter || ""}
            onChange={(e) => setCustomerFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">All Customers</option>
            {customerIds.map((id) => (
              <option key={id} value={id}>
                Customer {id}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredRovers.length > 0 ? (
          <>
            {filteredRovers.map((rover) => (
              <div
                key={rover.id}
                className={`p-4 border rounded-lg mb-3 ${
                  selectedRover === rover.id ? "border-blue-500 bg-blue-50" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium text-lg">{rover.name}</h3>
                    <Badge variant="outline" className="ml-2">
                      {rover.identifier}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(rover.status)}>{rover.status}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedRover(selectedRover === rover.id ? null : rover.id)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedRover === rover.id && (
                  <div className="mt-3 bg-white p-3 rounded-md border">
                    <Tabs defaultValue="details">
                      <TabsList className="mb-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="network">Network</TabsTrigger>
                        <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">ID:</div>
                          <div>{rover.id}</div>
                          <div className="font-medium">Name:</div>
                          <div>{rover.name}</div>
                          <div className="font-medium">Identifier:</div>
                          <div className="font-mono">{rover.identifier}</div>
                          <div className="font-medium">Status:</div>
                          <div>{rover.status}</div>
                          <div className="font-medium">Customer ID:</div>
                          <div>{rover.customer_id}</div>
                        </div>
                      </TabsContent>

                      <TabsContent value="network">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">IP Address:</div>
                          <div className="font-mono">{rover.ip_address}</div>
                          <div className="font-medium">Last Seen:</div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-blue-500" />
                            {getTimeAgo(rover.last_seen)}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timestamps">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">Created:</div>
                          <div>{new Date(rover.created_at).toLocaleString()}</div>
                          <div className="font-medium">Updated:</div>
                          <div>{new Date(rover.updated_at).toLocaleString()}</div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => onSelectRover?.(rover.id)}>
                        Select Rover
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {rovers.length > filteredRovers.length && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                Showing {filteredRovers.length} of {rovers.length} rovers
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No rovers found. {customerFilter ? "Try changing the customer filter." : ""}
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm" onClick={fetchRovers}>
            Refresh
          </Button>
          <div className="text-xs text-muted-foreground">Auto-refreshes every 5 seconds</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoverList
