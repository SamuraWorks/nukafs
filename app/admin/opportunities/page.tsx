"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  Plus,
  Search,
  FileText,
  Clock,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OPPORTUNITY_TYPES } from "@/lib/constants/opportunities-announcements"

// In production, opportunities come from app state (Supabase). Fallback to empty list.

export default function OpportunitiesPage() {
  const { currentUser, currentRole } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const canPublish =
    currentRole === "super_admin" ||
    (currentRole === "stakeholder" && currentUser?.status === "active")

  const { opportunities } = useAppState()

  const filteredOpportunities = useMemo(() => {
    const list = opportunities ?? []
    return list.filter((opp: any) => {
      const title = String(opp.title ?? "")
      const org = String(opp.organizationName ?? opp.organization ?? "")
      const category = String(opp.category ?? opp.type ?? "")

      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || org.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [opportunities, searchQuery, selectedCategory])

  const isDeadlineSoon = (deadline: string) => {
    const days = Math.floor(
      (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return days < 14 && days >= 0
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Scholarships, jobs, internships, and more for NUKaFs members
          </p>
        </div>

        {canPublish && (
          <Button
            asChild
            size="lg"
            className="gap-2"
          >
            <Link href="/admin/opportunities/create">
              <Plus className="size-4" />
              Publish Opportunity
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {OPPORTUNITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No opportunities found matching your search
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold line-clamp-2">{opp.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {opp.organizationName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {opp.category}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {opp.description}
                  </p>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    {opp.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3" />
                        {opp.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3" />
                      Deadline: {new Date(opp.deadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Status and CTA */}
                <div className="mt-4 pt-4 border-t space-y-3">
                  {isDeadlinePassed(opp.deadline) ? (
                    <Badge variant="outline" className="text-red-600 w-full justify-center">
                      <Clock className="size-3 mr-1" />
                      Deadline Passed
                    </Badge>
                  ) : isDeadlineSoon(opp.deadline) ? (
                    <Badge className="bg-amber-600 w-full justify-center">
                      <Clock className="size-3 mr-1" />
                      Apply Soon
                    </Badge>
                  ) : null}

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <a href={`/opportunities/${opp.id}`}>
                      <ExternalLink className="size-3" />
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
