"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Bell,
  Lock,
  Moon,
  Shield,
  Smartphone,
  Globe,
  Monitor,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAppState } from "@/lib/context/app-state-context"
import { readStorage, writeStorage } from "@/lib/storage/persistence"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import { changePassword } from "@/lib/supabase/auth"

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2 border-b pb-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

interface UserPreferences {
  language: string
  emailAnnouncements: boolean
  emailOpportunities: boolean
  emailEvents: boolean
  smsUpdates: boolean
  browserPush: boolean
  weeklyDigest: boolean
  profileVisible: boolean
  showEmail: boolean
  showPhone: boolean
}

const defaultPreferences: UserPreferences = {
  language: "English",
  emailAnnouncements: true,
  emailOpportunities: true,
  emailEvents: false,
  smsUpdates: false,
  browserPush: true,
  weeklyDigest: true,
  profileVisible: true,
  showEmail: false,
  showPhone: false,
}

export function AccountSettingsPage({
  title = "Account Settings",
  description = "Manage your personal preferences, notifications, and security options.",
}: {
  title?: string
  description?: string
}) {
  const { currentUser } = useAppState()
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    readStorage(STORAGE_KEYS.userPreferences, defaultPreferences),
  )
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" })
  const [pwLoading, setPwLoading] = useState(false)

  const savePrefs = (next: UserPreferences) => {
    setPrefs(next)
    writeStorage(STORAGE_KEYS.userPreferences, next)
  }

  const updatePref = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => {
    savePrefs({ ...prefs, [key]: value })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      toast.error("Please complete all password fields.")
      return
    }

    if (pwForm.next.length < 8) {
      toast.error("New password must be at least 8 characters.")
      return
    }

    if (pwForm.next !== pwForm.confirm) {
      toast.error("Passwords do not match.")
      return
    }

    setPwLoading(true)

    try {
      const result = await changePassword(pwForm.current, pwForm.next)
      if (!result.success) {
        toast.error(result.message ?? "Unable to update password.")
        return
      }

      setPwForm({ current: "", next: "", confirm: "" })
      toast.success(result.message ?? "Password updated successfully.")
    } catch {
      toast.error("Password update failed. Please try again.")
    } finally {
      setPwLoading(false)
    }
  }

  const displayName =
    currentUser?.fullName || currentUser?.name || "Registry Member"

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-10 font-sans">
      <PageHeader title={title} description={description} />

      <Section title="Personal Preferences" icon={Globe}>
        <div className="py-3">
          <p className="text-sm font-medium">Display Language</p>
          <p className="text-xs text-muted-foreground">
            Choose your preferred language for the registry interface.
          </p>
          <select
            className="mt-2 w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={prefs.language}
            onChange={(e) => updatePref("language", e.target.value)}
          >
            <option>English</option>
            <option>Krio</option>
            <option>French</option>
          </select>
        </div>
        <div className="py-3 text-sm">
          <span className="text-muted-foreground">Signed in as </span>
          <span className="font-semibold">{displayName}</span>
        </div>
      </Section>

      <Section title="Notification Preferences" icon={Bell}>
        <Toggle
          checked={prefs.emailAnnouncements}
          onChange={(v) => updatePref("emailAnnouncements", v)}
          label="Email: Announcements"
          description="Receive registry announcements by email."
        />
        <Toggle
          checked={prefs.emailOpportunities}
          onChange={(v) => updatePref("emailOpportunities", v)}
          label="Email: Opportunities"
          description="Scholarships, internships, and job postings."
        />
        <Toggle
          checked={prefs.emailEvents}
          onChange={(v) => updatePref("emailEvents", v)}
          label="Email: Events"
          description="Career fairs, AGMs, and registry events."
        />
        <Toggle
          checked={prefs.smsUpdates}
          onChange={(v) => updatePref("smsUpdates", v)}
          label="SMS Updates"
          description="Critical alerts via SMS (mock)."
        />
        <Toggle
          checked={prefs.browserPush}
          onChange={(v) => updatePref("browserPush", v)}
          label="Browser Push Notifications"
        />
        <Toggle
          checked={prefs.weeklyDigest}
          onChange={(v) => updatePref("weeklyDigest", v)}
          label="Weekly Digest"
        />
      </Section>

      <Section title="Appearance" icon={Moon}>
        <div className="py-4 text-sm text-muted-foreground">
          <p>
            Theme switching is available via the sun/moon toggle in the top navigation bar.
          </p>
          <Badge variant="secondary" className="mt-3">
            Placeholder — backend theme sync coming soon
          </Badge>
        </div>
      </Section>

      <Section title="Privacy Settings" icon={Shield}>
        <Toggle
          checked={prefs.profileVisible}
          onChange={(v) => updatePref("profileVisible", v)}
          label="Profile visible to executives"
        />
        <Toggle
          checked={prefs.showEmail}
          onChange={(v) => updatePref("showEmail", v)}
          label="Show email on membership card"
        />
        <Toggle
          checked={prefs.showPhone}
          onChange={(v) => updatePref("showPhone", v)}
          label="Show phone on membership card"
        />
        <p className="py-3 text-xs text-muted-foreground">
          Placeholder — full privacy controls will sync with backend policies.
        </p>
      </Section>

      <Section title="Security Settings" icon={Lock}>
        <form id="password" onSubmit={handlePasswordChange} className="space-y-3 py-3">
          <p className="text-sm font-medium">Change Password</p>
          <Input
            type="password"
            placeholder="Current password"
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
          />
          <Input
            type="password"
            placeholder="New password"
            value={pwForm.next}
            onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
          />
          <Button type="submit" disabled={pwLoading} className="mt-2">
            {pwLoading ? "Updating..." : "Update Password"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Password updates are validated through Supabase Authentication and require your current password.
          </p>
        </form>
      </Section>

      <Section title="Session Information" icon={Smartphone}>
        <div className="space-y-3 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Device</span>
            <span className="font-medium">Web Browser</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session timeout</span>
            <span className="font-medium">24 hours (mock)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last activity</span>
            <span className="font-medium">Just now</span>
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Monitor className="size-3.5" />
            Placeholder — active sessions will be managed after backend integration.
          </div>
        </div>
      </Section>
    </div>
  )
}
