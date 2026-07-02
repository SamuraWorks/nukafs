"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Bell,
  Lock,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Shield,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { useRouter } from "next/navigation"

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="card-elevated rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { currentUser, switchRole, logout } = useAppState()
  const router = useRouter()

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAnnouncements: true,
    emailOpportunities: true,
    emailEvents: false,
    smsUpdates: false,
    browserPush: true,
    weeklyDigest: true,
  })

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowAnalytics: true,
  })

  // Password change
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false })
  const [pwLoading, setPwLoading] = useState(false)

  // Language / display
  const [language, setLanguage] = useState("English")
  const [theme, setTheme] = useState("system")

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match.")
      return
    }
    if (pwForm.next.length < 8) {
      toast.error("Password must be at least 8 characters.")
      return
    }
    setPwLoading(true)
    setTimeout(() => {
      setPwLoading(false)
      setPwForm({ current: "", next: "", confirm: "" })
      toast.success("Password updated successfully.")
    }, 1200)
  }

  const handleLogout = () => {
    toast.success("Logged out successfully.")
    logout()
    router.push("/login")
  }

  const handleDeleteAccount = () => {
    toast.error("Account deletion is managed by the Executive Council. Please contact registry@NUKaFs.org.")
  }

  const toggleNotif = (key: keyof typeof notifications) => (v: boolean) =>
    setNotifications((n) => ({ ...n, [key]: v }))

  const togglePrivacy = (key: keyof typeof privacy) => (v: boolean) =>
    setPrivacy((p) => ({ ...p, [key]: v }))

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2 pb-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your notification preferences, security, and account settings.
        </p>
      </div>

      {/* Account info summary */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ background: currentUser?.avatarColor || "var(--primary)" }}
        >
          {(currentUser?.fullName || currentUser?.name || "?")[0]}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{currentUser?.fullName || currentUser?.name || "Student Member"}</p>
          <p className="text-xs text-muted-foreground truncate">{currentUser?.email}</p>
        </div>
        <div className="ml-auto shrink-0">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-success/10 text-success">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </span>
        </div>
      </div>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Toggle
          checked={notifications.emailAnnouncements}
          onChange={toggleNotif("emailAnnouncements")}
          label="Email — Announcements"
          description="Receive general and urgent announcements via email."
        />
        <Toggle
          checked={notifications.emailOpportunities}
          onChange={toggleNotif("emailOpportunities")}
          label="Email — Opportunities"
          description="Scholarships, internships, and job listings."
        />
        <Toggle
          checked={notifications.emailEvents}
          onChange={toggleNotif("emailEvents")}
          label="Email — Events"
          description="Reminders for upcoming NUKaFs events and fairs."
        />
        <Toggle
          checked={notifications.smsUpdates}
          onChange={toggleNotif("smsUpdates")}
          label="SMS — Critical Updates"
          description="Receive critical registry updates by text message."
        />
        <Toggle
          checked={notifications.browserPush}
          onChange={toggleNotif("browserPush")}
          label="Browser Push Notifications"
          description="In-browser alerts while you are logged in."
        />
        <Toggle
          checked={notifications.weeklyDigest}
          onChange={toggleNotif("weeklyDigest")}
          label="Weekly Digest Email"
          description="A summary of activity sent every Monday morning."
        />
        <div className="pt-3">
          <button
            onClick={() => {
              setNotifications({ emailAnnouncements: true, emailOpportunities: true, emailEvents: false, smsUpdates: false, browserPush: true, weeklyDigest: true })
              toast.success("Notification preferences saved.")
            }}
            className="btn btn-primary text-sm px-4 py-2"
          >
            Save Preferences
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" icon={Lock}>
        <form onSubmit={handlePasswordChange} className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">Change your account password. It must be at least 8 characters.</p>
          {(["current", "next", "confirm"] as const).map((field) => (
            <div key={field} className="relative">
              <label className="block text-xs font-medium text-muted-foreground mb-1 capitalize">
                {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
              </label>
              <div className="relative">
                <input
                  type={showPw[field] ? "text" : "password"}
                  value={pwForm[field]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => ({ ...s, [field]: !s[field] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
            className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </Section>

      {/* Privacy */}
      <Section title="Privacy" icon={Shield}>
        <Toggle
          checked={privacy.profileVisible}
          onChange={togglePrivacy("profileVisible")}
          label="Profile Visibility"
          description="Allow executives to view your profile information."
        />
        <Toggle
          checked={privacy.showEmail}
          onChange={togglePrivacy("showEmail")}
          label="Show Email to Other Members"
          description="Display your email address in member directories."
        />
        <Toggle
          checked={privacy.showPhone}
          onChange={togglePrivacy("showPhone")}
          label="Show Phone Number to Other Members"
          description="Display your phone number in member directories."
        />
        <Toggle
          checked={privacy.allowAnalytics}
          onChange={togglePrivacy("allowAnalytics")}
          label="Allow Anonymous Analytics"
          description="Help NUKaFs improve by contributing anonymised usage data."
        />
        <div className="pt-3">
          <button
            onClick={() => toast.success("Privacy settings saved.")}
            className="btn btn-primary text-sm px-4 py-2"
          >
            Save Privacy Settings
          </button>
        </div>
      </Section>

      {/* Display */}
      <Section title="Display & Language" icon={Globe}>
        <div className="py-3 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option>English</option>
              <option>Krio</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Theme</label>
            <div className="flex gap-2">
              {[
                { value: "light", icon: Sun, label: "Light" },
                { value: "dark", icon: Moon, label: "Dark" },
                { value: "system", icon: Smartphone, label: "System" },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => toast.success("Display settings saved.")}
            className="btn btn-primary text-sm px-4 py-2"
          >
            Save Display Settings
          </button>
        </div>
      </Section>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="font-semibold text-destructive">Danger Zone</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-destructive/10">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out of all devices</p>
              <p className="text-xs text-muted-foreground mt-0.5">End all active sessions on all devices.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Delete account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove all your data. This is irreversible.</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
