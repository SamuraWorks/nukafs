"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Users, 
  UserCheck, 
  ClipboardEdit, 
  CalendarDays, 
  Plus, 
  Sparkles,
  Loader2,
  FileCheck2,
  ArrowRight
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { toast } from "sonner"

// Recharts imports (with SSR fix or client-side checks)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

import { membersByUniversity, membersByDistrict } from "@/lib/mock-data"

export default function ExecutiveOverviewPage() {
  const { 
    students, 
    pendingRegistrations, 
    editRequests, 
    events, 
    addAnnouncement, 
    addEvent 
  } = useAppState()

  // Modal control states
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false)
  const [isEvtModalOpen, setIsEvtModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [annForm, setAnnForm] = useState({ title: "", category: "General", body: "" })
  const [evtForm, setEvtForm] = useState({ title: "", date: "", time: "", location: "", description: "" })

  const totalActive = students.length
  const pendingRegCount = pendingRegistrations.length
  const editRequestsCount = editRequests.filter(r => r.status === "pending").length
  const upcomingEventsCount = events.filter(e => e.status === "upcoming").length

  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annForm.title || !annForm.body) {
      toast.error("Please fill in all announcement fields")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      addAnnouncement(annForm.title, annForm.category, annForm.body)
      setIsSubmitting(false)
      setIsAnnModalOpen(false)
      setAnnForm({ title: "", category: "General", body: "" })
      toast.success("Announcement published successfully!")
    }, 1200)
  }

  const handleEvtSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!evtForm.title || !evtForm.date || !evtForm.time || !evtForm.location || !evtForm.description) {
      toast.error("Please fill in all event fields")
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      addEvent(evtForm.title, evtForm.date, evtForm.time, evtForm.location, evtForm.description)
      setIsSubmitting(false)
      setIsEvtModalOpen(false)
      setEvtForm({ title: "", date: "", time: "", location: "", description: "" })
      toast.success("Event created and published!")
    }, 1200)
  }

  // Chart styling colors
  const COLORS = ["oklch(0.52 0.12 158)", "oklch(0.62 0.1 200)", "oklch(0.72 0.13 85)", "oklch(0.55 0.13 25)"]

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PageHeader 
        title="Executive Hub Dashboard"
        description="Monitor student records, approve registration queues, and post opportunities."
        action={
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsAnnModalOpen(true)}
              className="flex items-center gap-1 h-9 cursor-pointer"
            >
              <Plus className="size-4" /> Announcement
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsEvtModalOpen(true)}
              className="flex items-center gap-1 h-9 cursor-pointer"
            >
              <Plus className="size-4" /> Event
            </Button>
          </div>
        }
      />

      {/* Grid of stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/executive/students" className="block hover:scale-[1.01] active:scale-[0.99] transition-transform">
          <StatCard label="Active Students" value={totalActive} icon={Users} trend="+8.4%" trendUp={true} hint="this month" />
        </Link>
        <Link href="/executive/approvals" className="block hover:scale-[1.01] active:scale-[0.99] transition-transform">
          <StatCard label="Pending Registrations" value={pendingRegCount} icon={UserCheck} trend={pendingRegCount > 0 ? `${pendingRegCount} pending` : "0 waiting"} trendUp={pendingRegCount > 0} hint="action required" />
        </Link>
        <Link href="/executive/profile-updates" className="block hover:scale-[1.01] active:scale-[0.99] transition-transform">
          <StatCard label="Edit Requests" value={editRequestsCount} icon={ClipboardEdit} trend={editRequestsCount > 0 ? `${editRequestsCount} waiting` : "Clean queue"} trendUp={editRequestsCount > 0} hint="profile verification" />
        </Link>
        <div className="block">
          <StatCard label="Upcoming Events" value={upcomingEventsCount} icon={CalendarDays} />
        </div>
      </div>

      {/* Analytical Charts */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* University distribution bar chart */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Enrollment by University</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Live Registry Count</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByUniversity} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* District Pie chart */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">District Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col items-center justify-center h-72 gap-4">
            <div className="size-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membersByDistrict}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {membersByDistrict.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              {membersByDistrict.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK POST DIALOGS */}
      {/* 1. Add Announcement Dialog */}
      <Dialog open={isAnnModalOpen} onOpenChange={setIsAnnModalOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-base font-bold flex items-center gap-2">
              <Sparkles className="size-4.5 text-primary" /> Publish Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Draft a news feed article to broadcast to all registered students.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAnnSubmit} className="flex flex-col gap-4 py-3">
            <FieldGroup className="gap-3.5">
              <Field>
                <FieldLabel htmlFor="ann-title">Article Title</FieldLabel>
                <Input
                  id="ann-title"
                  placeholder="e.g. 2024 Scholarship Form Extension"
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ann-category">Feed Category</FieldLabel>
                <Select
                  value={annForm.category}
                  onValueChange={(val) => setAnnForm({ ...annForm, category: val })}
                >
                  <SelectTrigger id="ann-category">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="Opportunity">Opportunity</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="ann-body">Announcement Details</FieldLabel>
                <Textarea
                  id="ann-body"
                  rows={4}
                  placeholder="Write announcement text here..."
                  value={annForm.body}
                  onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 border-t pt-4 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAnnModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Publish Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Create Event Dialog */}
      <Dialog open={isEvtModalOpen} onOpenChange={setIsEvtModalOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="font-heading text-base font-bold flex items-center gap-2">
              <CalendarDays className="size-4.5 text-primary" /> Create Union Event
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Schedule a career panel, bootcamp, or general meeting.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEvtSubmit} className="flex flex-col gap-4 py-3">
            <FieldGroup className="gap-3.5">
              <Field>
                <FieldLabel htmlFor="evt-title">Event Title</FieldLabel>
                <Input
                  id="evt-title"
                  placeholder="e.g. Freetown FBC Meet & Greet"
                  value={evtForm.title}
                  onChange={(e) => setEvtForm({ ...evtForm, title: e.target.value })}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="evt-date">Date</FieldLabel>
                  <Input
                    id="evt-date"
                    type="date"
                    value={evtForm.date}
                    onChange={(e) => setEvtForm({ ...evtForm, date: e.target.value })}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="evt-time">Start Time</FieldLabel>
                  <Input
                    id="evt-time"
                    placeholder="e.g. 10:00 AM"
                    value={evtForm.time}
                    onChange={(e) => setEvtForm({ ...evtForm, time: e.target.value })}
                    required
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="evt-location">Venue / Location</FieldLabel>
                <Input
                  id="evt-location"
                  placeholder="e.g. Kabala Community Centre"
                  value={evtForm.location}
                  onChange={(e) => setEvtForm({ ...evtForm, location: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="evt-desc">Short Description</FieldLabel>
                <Textarea
                  id="evt-desc"
                  rows={3}
                  placeholder="Provide outline and eligibility details..."
                  value={evtForm.description}
                  onChange={(e) => setEvtForm({ ...evtForm, description: e.target.value })}
                  required
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 border-t pt-4 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEvtModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Publish Event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
