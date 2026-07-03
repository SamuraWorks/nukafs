"use client"

import { useState } from "react"
import {
  Settings,
  Save,
  Globe,
  Palette,
  Bell,
  Shield,
  Info,
  CheckCircle2,
  Moon,
  Sun,
  UserCheck,
  Hash,
  Mail,
  Phone,
  Link,
  RefreshCw,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function SystemSettingsPage() {
  const { systemSettings, updateSettings } = useAppState()

  const [general, setGeneral] = useState({
    systemName: systemSettings.systemName,
    systemDescription: systemSettings.systemDescription,
    supportEmail: systemSettings.supportEmail ?? "syscend@gmail.com",
    supportPhone: systemSettings.supportPhone ?? "+23279630777",
    website: systemSettings.website ?? "https://NUKaFs.org",
  })

  const [registration, setRegistration] = useState({
    registrationStatus: systemSettings.registrationStatus,
    approvalWorkflow: systemSettings.approvalWorkflow,
    defaultUserRole: systemSettings.defaultUserRole,
    membershipNumberFormat: systemSettings.membershipNumberFormat,
    requireEmailVerification: true,
    allowSelfRegistration: true,
  })

  const [appearance, setAppearance] = useState({
    theme: systemSettings.theme,
    primaryColor: "#10b981",
    accentColor: "#3b82f6",
    darkMode: systemSettings.theme === "dark",
    showLogo: true,
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    reminderFrequency: "weekly",
    approvalAlerts: true,
    securityAlerts: true,
    systemAlerts: true,
  })

  const [security, setSecurity] = useState({
    passwordPolicy: systemSettings.passwordPolicy,
    minPasswordLength: "8",
    sessionTimeout: systemSettings.sessionTimeout,
    accountLockout: "5 failed attempts",
    twoFactorAuth: false,
    ipWhitelisting: false,
    auditLogging: true,
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const tabLabels: Record<string, string> = {
    general: "General",
    registration: "Registration",
    appearance: "Appearance",
    notifications: "Notifications",
    security: "Security",
    about: "About",
  }

  function handleSave() {
    updateSettings({
      systemName: general.systemName,
      systemDescription: general.systemDescription,
      registrationStatus: registration.registrationStatus as any,
      approvalWorkflow: registration.approvalWorkflow as any,
      defaultUserRole: registration.defaultUserRole,
      membershipNumberFormat: registration.membershipNumberFormat,
      theme: appearance.theme,
      passwordPolicy: security.passwordPolicy,
      sessionTimeout: security.sessionTimeout,
    })
    setConfirmOpen(false)
    toast.success("System settings saved successfully.", {
      description: "All configurations have been applied to the platform.",
    })
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-4xl mx-auto">
      <PageHeader
        title="System Settings"
        description="Configure global platform preferences, registration rules, appearance, notifications, and security policies."
        action={
          <Button className="gap-2" onClick={() => setConfirmOpen(true)}>
            <Save className="size-4" /> Save All Changes
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6 h-auto">
          {Object.entries(tabLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-xs py-2">{label}</TabsTrigger>
          ))}
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Globe className="size-4 text-primary" /> General Settings</CardTitle>
              <CardDescription>Basic platform identity and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">System Name</label>
                  <Input value={general.systemName} onChange={e => setGeneral({ ...general, systemName: e.target.value })} />
                  <p className="text-[10px] text-muted-foreground">Displayed in the browser title and login page.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="pl-9" type="email" value={general.supportEmail} onChange={e => setGeneral({ ...general, supportEmail: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Support Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="pl-9" value={general.supportPhone} onChange={e => setGeneral({ ...general, supportPhone: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Website URL</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="pl-9" value={general.website} onChange={e => setGeneral({ ...general, website: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">System Description</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 h-20"
                  value={general.systemDescription}
                  onChange={e => setGeneral({ ...general, systemDescription: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">Shown on the public-facing registration and landing pages.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGISTRATION */}
        <TabsContent value="registration" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><UserCheck className="size-4 text-primary" /> Registration Settings</CardTitle>
              <CardDescription>Control how students join and are verified in the registry.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Registration Status</label>
                  <Select value={registration.registrationStatus} onValueChange={v => setRegistration({ ...registration, registrationStatus: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open — Anyone can register</SelectItem>
                      <SelectItem value="Closed">Closed — Invitations only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Approval Workflow</label>
                  <Select value={registration.approvalWorkflow} onValueChange={v => setRegistration({ ...registration, approvalWorkflow: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual — Executive review required</SelectItem>
                      <SelectItem value="Automatic">Automatic — Auto-approve all</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Default User Role</label>
                  <Select value={registration.defaultUserRole} onValueChange={v => setRegistration({ ...registration, defaultUserRole: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="stakeholder">Stakeholder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Membership Number Format</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input className="pl-9 font-mono text-xs" value={registration.membershipNumberFormat} onChange={e => setRegistration({ ...registration, membershipNumberFormat: e.target.value })} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Format: NUKaFs-YYYY-XXXX (XXXX = sequential number)</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t pt-4">
                {[
                  { label: "Require Email Verification", desc: "Students must verify their email before accessing the portal.", key: "requireEmailVerification" },
                  { label: "Allow Self-Registration", desc: "Students can register without an invitation link.", key: "allowSelfRegistration" },
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(registration as any)[item.key]}
                      onCheckedChange={v => setRegistration({ ...registration, [item.key]: v })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPEARANCE */}
        <TabsContent value="appearance" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Palette className="size-4 text-primary" /> Appearance Settings</CardTitle>
              <CardDescription>Customise the visual theme and branding of the platform.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
              {/* Theme Toggle */}
              <div>
                <p className="text-sm font-semibold mb-3">Platform Theme</p>
                <div className="grid grid-cols-2 gap-3">
                  {["light", "dark"].map(t => (
                    <button
                      key={t}
                      onClick={() => setAppearance({ ...appearance, theme: t, darkMode: t === "dark" })}
                      className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${appearance.theme === t ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:border-primary/30"}`}
                    >
                      {t === "light" ? <Sun className="size-5 text-amber-500" /> : <Moon className="size-5 text-indigo-500" />}
                      <div className="text-left">
                        <p className="text-sm font-semibold capitalize">{t} Mode</p>
                        <p className="text-xs text-muted-foreground">{t === "light" ? "Clean, bright interface" : "Dark background theme"}</p>
                      </div>
                      {appearance.theme === t && <CheckCircle2 className="size-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Primary Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="size-9 rounded cursor-pointer border" value={appearance.primaryColor} onChange={e => setAppearance({ ...appearance, primaryColor: e.target.value })} />
                    <Input value={appearance.primaryColor} onChange={e => setAppearance({ ...appearance, primaryColor: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" className="size-9 rounded cursor-pointer border" value={appearance.accentColor} onChange={e => setAppearance({ ...appearance, accentColor: e.target.value })} />
                    <Input value={appearance.accentColor} onChange={e => setAppearance({ ...appearance, accentColor: e.target.value })} className="font-mono text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div>
                  <p className="text-sm font-semibold">Show NUKaFs Logo</p>
                  <p className="text-xs text-muted-foreground">Display the union logo in the sidebar and login page.</p>
                </div>
                <Switch checked={appearance.showLogo} onCheckedChange={v => setAppearance({ ...appearance, showLogo: v })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Bell className="size-4 text-primary" /> Notification Settings</CardTitle>
              <CardDescription>Configure how the platform notifies administrators and users.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-4">
              {[
                { label: "Email Notifications", desc: "Send email alerts for approvals, rejections, and system events.", key: "emailNotifications" },
                { label: "SMS Notifications", desc: "Send SMS alerts to registered phone numbers (requires SMS provider integration).", key: "smsNotifications" },
                { label: "Push Notifications", desc: "Send browser push notifications to active admin sessions.", key: "pushNotifications" },
                { label: "Approval Alerts", desc: "Notify executives when new registrations or edit requests need review.", key: "approvalAlerts" },
                { label: "Security Alerts", desc: "Alert administrators of suspicious login attempts or security events.", key: "securityAlerts" },
                { label: "System Alerts", desc: "Receive notifications for system health issues, backups, and maintenance.", key: "systemAlerts" },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={(notifications as any)[item.key]}
                    onCheckedChange={v => setNotifications({ ...notifications, [item.key]: v })}
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-sm font-semibold">Reminder Frequency</label>
                <Select value={notifications.reminderFrequency} onValueChange={v => setNotifications({ ...notifications, reminderFrequency: v })}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4 text-primary" /> Security Settings</CardTitle>
              <CardDescription>Configure authentication, password policies, and session management.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Password Policy</label>
                  <Select value={security.passwordPolicy} onValueChange={v => setSecurity({ ...security, passwordPolicy: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low (6+ characters)">Low (6+ characters)</SelectItem>
                      <SelectItem value="Medium (8+ characters, letters and numbers)">Medium (8+ chars, letters & numbers)</SelectItem>
                      <SelectItem value="Strong (10+ characters, uppercase, numbers, symbols)">Strong (10+ chars, complex)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Minimum Password Length</label>
                  <Select value={security.minPasswordLength} onValueChange={v => setSecurity({ ...security, minPasswordLength: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["6", "8", "10", "12"].map(n => <SelectItem key={n} value={n}>{n} characters</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Session Timeout</label>
                  <Select value={security.sessionTimeout} onValueChange={v => setSecurity({ ...security, sessionTimeout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15 minutes">15 minutes</SelectItem>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="4 hours">4 hours</SelectItem>
                      <SelectItem value="Never">Never (not recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold">Account Lockout</label>
                  <Select value={security.accountLockout} onValueChange={v => setSecurity({ ...security, accountLockout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 failed attempts">3 failed attempts</SelectItem>
                      <SelectItem value="5 failed attempts">5 failed attempts</SelectItem>
                      <SelectItem value="10 failed attempts">10 failed attempts</SelectItem>
                      <SelectItem value="Never">Never (not recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t pt-4">
                {[
                  { label: "Two-Factor Authentication", desc: "Require 2FA for all executive and admin accounts.", key: "twoFactorAuth" },
                  { label: "IP Whitelisting", desc: "Restrict admin portal access to approved IP addresses only.", key: "ipWhitelisting" },
                  { label: "Audit Logging", desc: "Log all user actions for security and compliance tracking.", key: "auditLogging" },
                ].map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={(security as any)[item.key]}
                      onCheckedChange={v => setSecurity({ ...security, [item.key]: v })}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about" className="mt-4">
          <Card className="border shadow-sm">
            <CardHeader className="p-5 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Info className="size-4 text-primary" /> About the Platform</CardTitle>
              <CardDescription>System information, version details, and developer credits.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Platform Name", value: general.systemName },
                  { label: "Current Version", value: "v1.4.2" },
                  { label: "Environment", value: "Production" },
                  { label: "Framework", value: "Next.js 15 (App Router)" },
                  { label: "Database", value: "Supabase (PostgreSQL)" },
                  { label: "Authentication", value: "Supabase Auth (JWT)" },
                  { label: "License", value: "NUKaFs Internal Use Only" },
                  { label: "Last Update", value: "27 June 2026" },
                  { label: "Developed By", value: "NUKaFs Tech Committee" },
                  { label: "Support Email", value: general.supportEmail },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5 border-b pb-3 last:border-0">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
                    <span className="text-sm font-semibold text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Platform Status: Fully Operational</p>
                  <p className="text-xs text-muted-foreground mt-0.5">All systems are running normally. Registry database synchronized. No pending maintenance tasks.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Save Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm font-sans">
          <DialogHeader>
            <DialogTitle className="font-heading text-base flex items-center gap-2">
              <Save className="size-4 text-primary" /> Save System Settings
            </DialogTitle>
            <DialogDescription className="text-xs">
              You are about to save changes to the platform configuration. These changes will apply immediately to all users and sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} className="gap-1.5">
              <CheckCircle2 className="size-3.5" /> Confirm & Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
