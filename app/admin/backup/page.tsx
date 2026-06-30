"use client"

import { useState } from "react"
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Calendar,
  Shield,
  Plus,
  FileArchive,
} from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Backup {
  id: string
  name: string
  date: string
  time: string
  size: string
  sizeBytes: number
  status: "success" | "failed" | "in_progress"
  type: "Automatic" | "Manual"
  location: string
}

const BACKUPS: Backup[] = [
  { id: "bk_1", name: "auto_backup_20240903_0200", date: "2024-09-03", time: "02:00 AM", size: "284 MB", sizeBytes: 284, status: "success", type: "Automatic", location: "Supabase Storage / backups/" },
  { id: "bk_2", name: "manual_backup_20240901_admin", date: "2024-09-01", time: "10:45 AM", size: "281 MB", sizeBytes: 281, status: "success", type: "Manual", location: "Supabase Storage / backups/" },
  { id: "bk_3", name: "auto_backup_20240901_0200", date: "2024-09-01", time: "02:00 AM", size: "280 MB", sizeBytes: 280, status: "success", type: "Automatic", location: "Supabase Storage / backups/" },
  { id: "bk_4", name: "auto_backup_20240831_0200", date: "2024-08-31", time: "02:00 AM", size: "278 MB", sizeBytes: 278, status: "success", type: "Automatic", location: "Supabase Storage / backups/" },
  { id: "bk_5", name: "auto_backup_20240830_0200", date: "2024-08-30", time: "02:00 AM", size: "276 MB", sizeBytes: 276, status: "failed", type: "Automatic", location: "Supabase Storage / backups/" },
  { id: "bk_6", name: "auto_backup_20240829_0200", date: "2024-08-29", time: "02:00 AM", size: "275 MB", sizeBytes: 275, status: "success", type: "Automatic", location: "Supabase Storage / backups/" },
  { id: "bk_7", name: "manual_backup_20240825_admin", date: "2024-08-25", time: "03:20 PM", size: "272 MB", sizeBytes: 272, status: "success", type: "Manual", location: "Supabase Storage / backups/" },
]

export default function BackupRecoveryPage() {
  const [backups, setBackups] = useState(BACKUPS)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState<Backup | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Backup | null>(null)
  const [progress, setProgress] = useState(0)

  const lastBackup = backups.filter(b => b.status === "success")[0]
  const totalSize = backups.reduce((sum, b) => sum + b.sizeBytes, 0)
  const successCount = backups.filter(b => b.status === "success").length

  function handleCreate() {
    setIsCreating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          const newBackup: Backup = {
            id: `bk_${Date.now()}`,
            name: `manual_backup_${new Date().toISOString().split("T")[0].replace(/-/g, "")}_admin`,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            size: "285 MB",
            sizeBytes: 285,
            status: "success",
            type: "Manual",
            location: "Supabase Storage / backups/",
          }
          setBackups(prev => [newBackup, ...prev])
          setIsCreating(false)
          toast.success("Manual backup created successfully.", { description: "285 MB backed up to Supabase Storage." })
          return 100
        }
        return p + Math.random() * 15
      })
    }, 200)
  }

  function handleDelete(backup: Backup) {
    setBackups(prev => prev.filter(b => b.id !== backup.id))
    setConfirmDelete(null)
    toast.success(`Backup "${backup.name}" has been deleted.`)
  }

  function handleRestore(backup: Backup) {
    setConfirmRestore(null)
    toast.info(`Restore initiated from "${backup.name}". This operation would take 2–5 minutes in production.`)
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Backup & Recovery"
        description="Manage platform data backups, schedule automated backups, and restore from checkpoints."
        action={
          <Button onClick={handleCreate} disabled={isCreating} className="gap-2">
            {isCreating ? <RefreshCw className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {isCreating ? "Creating Backup..." : "Create Backup"}
          </Button>
        }
      />

      {/* Progress Bar */}
      {isCreating && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-primary flex items-center gap-2">
              <RefreshCw className="size-3.5 animate-spin" /> Creating manual backup...
            </span>
            <span className="text-muted-foreground">{Math.round(Math.min(progress, 100))}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Last Backup" value={lastBackup?.date || "—"} icon={Clock} hint={lastBackup?.time} />
        <StatCard label="Backup Storage Used" value={`${totalSize} MB`} icon={HardDrive} trend="of 5 GB allocated" trendUp={false} hint="" />
        <StatCard label="Successful Backups" value={successCount} icon={CheckCircle2} trend="Last 30 days" trendUp={true} hint="" />
        <StatCard label="Next Scheduled" value="Tomorrow" icon={Calendar} hint="02:00 AM automatic" />
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
              <CheckCircle2 className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Backup Status</p>
              <p className="font-bold text-sm text-foreground">Operational</p>
              <p className="text-[10px] text-emerald-600">Last backup: {lastBackup?.date} at {lastBackup?.time}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HardDrive className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Storage Location</p>
              <p className="font-bold text-sm text-foreground">Supabase Storage</p>
              <p className="text-[10px] text-muted-foreground">Encrypted at rest (AES-256)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <Shield className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Retention Policy</p>
              <p className="font-bold text-sm text-foreground">30 Days</p>
              <p className="text-[10px] text-muted-foreground">Auto-delete after 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History Table */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileArchive className="size-4 text-primary" /> Backup History
              </CardTitle>
              <CardDescription className="mt-0.5">{backups.length} backups on record</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold">Backup Name</TableHead>
                  <TableHead className="text-xs font-bold">Date</TableHead>
                  <TableHead className="text-xs font-bold">Time</TableHead>
                  <TableHead className="text-xs font-bold">Size</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold">Type</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map(backup => (
                  <TableRow key={backup.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs font-mono text-foreground">{backup.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{backup.date}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{backup.time}</TableCell>
                    <TableCell className="text-xs font-semibold">{backup.size}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        backup.status === "success"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                          : backup.status === "failed"
                          ? "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                          : "bg-primary/10 text-primary border-primary/20 text-[10px]"
                      }>
                        {backup.status === "success" ? "✓ Success" : backup.status === "failed" ? "✗ Failed" : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{backup.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1 h-7"
                          disabled={backup.status !== "success"}
                          onClick={() => toast.success(`Downloading ${backup.name}...`)}
                          title="Download"
                        >
                          <Download className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1 h-7"
                          disabled={backup.status !== "success"}
                          onClick={() => setConfirmRestore(backup)}
                          title="Restore"
                        >
                          <Upload className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:text-destructive h-7"
                          onClick={() => setConfirmDelete(backup)}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
            <span>Storage: <strong className="text-foreground">{totalSize} MB</strong> used</span>
            <span><strong className="text-foreground">{backups.length}</strong> backup snapshots retained</span>
          </div>
        </CardContent>
      </Card>

      {/* Automated Backup Schedule Info */}
      <Card className="border shadow-xs border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Calendar className="size-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Automated Backup Schedule</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              The platform automatically creates a full backup every day at <strong>02:00 AM GMT</strong>. Backups are stored securely in Supabase Storage and retained for <strong>30 days</strong>. Manual backups can be created at any time using the Create Backup button above.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Restore Confirmation */}
      <Dialog open={!!confirmRestore} onOpenChange={open => !open && setConfirmRestore(null)}>
        {confirmRestore && (
          <DialogContent className="max-w-sm font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading text-base flex items-center gap-2">
                <Upload className="size-4 text-amber-500" /> Restore from Backup
              </DialogTitle>
              <DialogDescription className="text-xs">
                You are about to restore the platform from backup <strong>{confirmRestore.name}</strong> ({confirmRestore.date}). This will overwrite current data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2 mt-2">
              <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
              Warning: All data modified after this backup point will be lost permanently.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmRestore(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleRestore(confirmRestore)}>
                Confirm Restore
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={open => !open && setConfirmDelete(null)}>
        {confirmDelete && (
          <DialogContent className="max-w-sm font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading text-base">Delete Backup</DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to permanently delete backup <strong>{confirmDelete.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(confirmDelete)}>
                <Trash2 className="size-3.5 mr-1" /> Delete Backup
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
