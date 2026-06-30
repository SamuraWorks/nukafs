"use client"

import Link from "next/link"
import { 
  UserCheck, 
  Sparkles, 
  ArrowRight, 
  IdCard, 
  Award, 
  CalendarDays, 
  Bell, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  GraduationCap
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PageHeader, StatusBadge } from "@/components/dashboard/ui-bits"
import { Badge } from "@/components/ui/badge"

export default function StudentDashboardPage() {
  const { currentUser, announcements, events, notifications, registeredEvents, currentRole } = useAppState()

  const userDisplayName = currentUser?.fullName || "Student Member"
  const completionPercent = currentUser?.profileCompletion || 0
  const isComplete = completionPercent === 100

  // Filter recent data
  const recentAnnouncements = announcements.slice(0, 3)
  const upcomingEvents = events.filter(e => e.status === "upcoming").slice(0, 2)
  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3)

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PageHeader 
        title={`Welcome, ${userDisplayName}`} 
        description="Access and manage your student profile and resources here."
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Profile Completion and Card status */}
        <Card className="md:col-span-8 bg-gradient-to-br from-card via-card to-primary/5 border">
          <CardContent className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-lg font-bold">Registry Verification Status</span>
                  <StatusBadge status={currentUser?.status || "pending"} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isComplete 
                    ? "Your profile is fully setup and verified by NUKAFS Executives." 
                    : "Please complete your registry setup to unlock all features."}
                </p>
              </div>
              <Button 
                size="sm" 
                variant={isComplete ? "outline" : "default"}
                nativeButton={false}
                render={
                  <Link href="/dashboard/profile">
                    {isComplete ? "View Registry Profile" : "Complete Profile setup"}
                  </Link>
                }
              />
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-background/50 border p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="flex items-center gap-1.5"><Sparkles className="size-4 text-primary" /> Profile Setup Progress</span>
                <span className="text-primary">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
              {!isComplete && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <AlertTriangle className="size-3.5 text-amber-500" /> Academic, contact, and chiefdom details are required.
                </p>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Action shortcuts</span>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="hover:shadow-md transition-all border border-border/80 group">
                  <Link href="/dashboard/membership-card" className="flex flex-col gap-2 p-4 h-full justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <IdCard className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-semibold group-hover:text-primary transition-colors">Digital ID Card</h4>
                      <p className="text-xs text-muted-foreground mt-1">Access your QR-enabled membership card.</p>
                    </div>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-all border border-border/80 group">
                  <Link href="/dashboard/opportunities" className="flex flex-col gap-2 p-4 h-full justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Award className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-semibold group-hover:text-primary transition-colors">Opportunities</h4>
                      <p className="text-xs text-muted-foreground mt-1">Explore custom scholarships and jobs.</p>
                    </div>
                  </Link>
                </Card>

                <Card className="hover:shadow-md transition-all border border-border/80 group">
                  <Link href="/dashboard/events" className="flex flex-col gap-2 p-4 h-full justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <CalendarDays className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-semibold group-hover:text-primary transition-colors">Events &amp; Fairs</h4>
                      <p className="text-xs text-muted-foreground mt-1">Browse union schedules and RSVP.</p>
                    </div>
                  </Link>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Sidebar */}
        <Card className="md:col-span-4 border">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Bell className="size-4 text-primary" /> Notifications</span>
              {unreadNotifications.length > 0 && (
                <Badge variant="secondary">{unreadNotifications.length} unread</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <CheckCircle2 className="size-8 text-primary/30" />
                <span className="text-xs font-semibold">All caught up!</span>
                <span className="text-[10px] text-muted-foreground">No new unread system messages.</span>
              </div>
            ) : (
              unreadNotifications.map((notif) => (
                <div key={notif.id} className="flex gap-2.5 rounded-lg border bg-card p-3 text-left shadow-sm">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-xs text-foreground truncate">{notif.title}</span>
                    <span className="text-[11px] text-muted-foreground leading-snug mt-1 break-words">
                      {notif.message}
                    </span>
                    <span className="text-[9px] text-muted-foreground mt-1.5">{notif.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Announcements */}
        <Card className="border">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Announcements</CardTitle>
              <CardDescription className="text-xs mt-0.5">Stay updated with union policies and news.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/announcements" className="text-xs flex items-center gap-1">All announcements <ArrowRight className="size-3.5" /></Link>} />
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {recentAnnouncements.map((ann) => (
              <div key={ann.id} className="group rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30">
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <Badge variant={ann.category === "Urgent" ? "destructive" : "secondary"} className="text-[9px] px-1 py-0 uppercase">
                    {ann.category}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{ann.date}</span>
                </div>
                <h4 className="font-heading text-sm font-bold leading-snug group-hover:text-primary transition-colors">{ann.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">{ann.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="border">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
              <CardDescription className="text-xs mt-0.5">Participate in networking and development bootcamps.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/dashboard/events" className="text-xs flex items-center gap-1">View Calendar <ArrowRight className="size-3.5" /></Link>} />
          </CardHeader>
          <CardContent className="p-4 flex flex-col gap-3">
            {upcomingEvents.map((evt) => {
              const isRegistered = registeredEvents.includes(evt.id)
              return (
                <div key={evt.id} className="flex gap-4 rounded-lg border bg-card p-4 items-start hover:shadow-sm transition-shadow">
                  <div className="flex flex-col items-center justify-center size-12 shrink-0 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <span className="text-[10px] font-bold uppercase leading-none">{new Date(evt.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-extrabold leading-none mt-1">{new Date(evt.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <h4 className="font-heading text-sm font-bold leading-snug truncate">{evt.title}</h4>
                    <span className="text-xs text-muted-foreground truncate">{evt.location} • {evt.time}</span>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{evt.description}</p>
                    {isRegistered && (
                      <Badge variant="outline" className="w-fit text-[9px] border-primary/30 bg-primary/5 text-primary mt-2">
                        Registered
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
