"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  ShieldOff,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/ui-bits"
import {
  type Chiefdom,
  type District,
  createChiefdom,
  createDistrict,
  fetchAllChiefdoms,
  fetchDistricts,
  updateChiefdom,
  updateDistrict,
} from "@/lib/services/geography-service"

// ── Types ───────────────────────────────────────────────────────────────────
type EditTarget =
  | { kind: "district"; district: District }
  | { kind: "chiefdom"; chiefdom: Chiefdom; districtName: string }
  | null

// ── Helpers ─────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  return status === "active" ? (
    <Badge variant="outline" className="border-emerald-600/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30">
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="border-amber-600/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30">
      Inactive
    </Badge>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminGeographyPage() {
  const [districts, setDistricts] = useState<District[]>([])
  const [chiefdoms, setChiefdoms] = useState<Chiefdom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")

  // ── Edit/Create state
  const [editTarget, setEditTarget] = useState<EditTarget>(null)
  const [editName, setEditName] = useState("")
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active")
  const [editLoading, setEditLoading] = useState(false)

  // ── Add district dialog
  const [showAddDistrict, setShowAddDistrict] = useState(false)
  const [newDistrictName, setNewDistrictName] = useState("")
  const [addDistrictLoading, setAddDistrictLoading] = useState(false)

  // ── Add chiefdom dialog
  const [showAddChiefdom, setShowAddChiefdom] = useState(false)
  const [addChiefdomDistrict, setAddChiefdomDistrict] = useState<District | null>(null)
  const [newChiefdomName, setNewChiefdomName] = useState("")
  const [addChiefdomLoading, setAddChiefdomLoading] = useState(false)

  // ── Load data
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [d, c] = await Promise.all([fetchDistricts(), fetchAllChiefdoms()])
      setDistricts(d)
      setChiefdoms(c)
    } catch (e: any) {
      setError(e?.message || "Failed to load geographic data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // ── Derived data
  const chiefdomsByDistrict = useMemo(() => {
    const map = new Map<string, Chiefdom[]>()
    for (const c of chiefdoms) {
      const arr = map.get(c.district_id) ?? []
      arr.push(c)
      map.set(c.district_id, arr)
    }
    return map
  }, [chiefdoms])

  const filteredDistricts = useMemo(() => {
    if (!search.trim()) return districts
    const q = search.toLowerCase()
    return districts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (chiefdomsByDistrict.get(d.id) ?? []).some((c) => c.name.toLowerCase().includes(q))
    )
  }, [districts, chiefdoms, search, chiefdomsByDistrict])

  // ── Stats
  const totalActive = districts.filter((d) => d.status === "active").length
  const totalChiefdoms = chiefdoms.length
  const activeChiefdoms = chiefdoms.filter((c) => c.status === "active").length

  // ── Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedDistricts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Open edit dialog
  const openEditDistrict = (district: District) => {
    setEditTarget({ kind: "district", district })
    setEditName(district.name)
    setEditStatus(district.status)
  }

  const openEditChiefdom = (chiefdom: Chiefdom, districtName: string) => {
    setEditTarget({ kind: "chiefdom", chiefdom, districtName })
    setEditName(chiefdom.name)
    setEditStatus(chiefdom.status)
  }

  // ── Save edit
  const handleSaveEdit = async () => {
    if (!editTarget) return
    if (!editName.trim()) {
      toast.error("Name cannot be empty.")
      return
    }
    setEditLoading(true)
    try {
      if (editTarget.kind === "district") {
        const updated = await updateDistrict(editTarget.district.id, {
          name: editName.trim(),
          status: editStatus,
        })
        setDistricts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
        toast.success(`District "${updated.name}" updated.`)
      } else {
        const updated = await updateChiefdom(editTarget.chiefdom.id, {
          name: editName.trim(),
          status: editStatus,
        })
        setChiefdoms((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        toast.success(`Chiefdom "${updated.name}" updated.`)
      }
      setEditTarget(null)
    } catch (e: any) {
      toast.error(e?.message || "Update failed.")
    } finally {
      setEditLoading(false)
    }
  }

  // ── Add district
  const handleAddDistrict = async () => {
    if (!newDistrictName.trim()) {
      toast.error("District name is required.")
      return
    }
    setAddDistrictLoading(true)
    try {
      const created = await createDistrict(newDistrictName.trim())
      setDistricts((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success(`District "${created.name}" created.`)
      setShowAddDistrict(false)
      setNewDistrictName("")
    } catch (e: any) {
      toast.error(e?.message || "Failed to create district.")
    } finally {
      setAddDistrictLoading(false)
    }
  }

  // ── Add chiefdom
  const handleAddChiefdom = async () => {
    if (!newChiefdomName.trim() || !addChiefdomDistrict) return
    setAddChiefdomLoading(true)
    try {
      const created = await createChiefdom(newChiefdomName.trim(), addChiefdomDistrict.id)
      setChiefdoms((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success(`Chiefdom "${created.name}" added to ${addChiefdomDistrict.name}.`)
      setShowAddChiefdom(false)
      setNewChiefdomName("")
      setAddChiefdomDistrict(null)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create chiefdom.")
    } finally {
      setAddChiefdomLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-5xl mx-auto font-sans">
      <PageHeader
        title="Geographic Registry"
        description="Manage districts, chiefdoms, and the geographic hierarchy used across all member profiles."
        action={
          <Button
            onClick={() => setShowAddDistrict(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="size-4" />
            Add District
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Districts", value: districts.length, icon: Globe, hint: `${totalActive} active` },
          {
            label: "Active Districts",
            value: totalActive,
            icon: MapPin,
            hint: `${districts.length - totalActive} inactive`,
          },
          { label: "Total Chiefdoms", value: totalChiefdoms, icon: MapPin, hint: `${activeChiefdoms} active` },
          {
            label: "Countries",
            value: 1,
            icon: Globe,
            hint: "Sierra Leone",
          },
        ].map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} className="border shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search districts or chiefdoms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          id="geo-search"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-sm text-muted-foreground">Loading geographic data…</span>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertCircle className="size-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={load} className="ml-auto">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-sm">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">Sierra Leone · Districts & Chiefdoms</CardTitle>
            <CardDescription>
              Click a district to expand its chiefdoms. Use the edit button to update names or toggle status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredDistricts.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No districts found{search ? ` for "${search}"` : ""}.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filteredDistricts.map((district) => {
                  const districtChiefdoms = chiefdomsByDistrict.get(district.id) ?? []
                  const isExpanded = expandedDistricts.has(district.id)
                  const filteredChiefdoms = search.trim()
                    ? districtChiefdoms.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
                    : districtChiefdoms

                  return (
                    <li key={district.id}>
                      {/* District row */}
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/5 transition-colors">
                        <button
                          onClick={() => toggleExpand(district.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                          id={`district-toggle-${district.id}`}
                        >
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                          )}
                          <Globe className="size-4 text-primary shrink-0" />
                          <span className="font-semibold text-sm">{district.name}</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            ({districtChiefdoms.length} chiefdom{districtChiefdoms.length !== 1 ? "s" : ""})
                          </span>
                        </button>
                        <div className="flex items-center gap-2">
                          {statusBadge(district.status)}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => openEditDistrict(district)}
                            title="Edit district"
                            id={`edit-district-${district.id}`}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={() => {
                              setAddChiefdomDistrict(district)
                              setShowAddChiefdom(true)
                            }}
                            title="Add chiefdom"
                            id={`add-chiefdom-${district.id}`}
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Chiefdoms list */}
                      {isExpanded && (
                        <ul className="border-t bg-muted/5 divide-y divide-border/50">
                          {filteredChiefdoms.length === 0 ? (
                            <li className="px-10 py-4 text-xs text-muted-foreground italic">
                              No chiefdoms found.
                            </li>
                          ) : (
                            filteredChiefdoms.map((chiefdom) => (
                              <li
                                key={chiefdom.id}
                                className="flex items-center gap-3 px-10 py-2.5 hover:bg-muted/5 transition-colors"
                              >
                                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                                <span className="flex-1 text-sm">{chiefdom.name}</span>
                                {statusBadge(chiefdom.status)}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => openEditChiefdom(chiefdom, district.name)}
                                  title="Edit chiefdom"
                                  id={`edit-chiefdom-${chiefdom.id}`}
                                >
                                  <Pencil className="size-3.5" />
                                </Button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget?.kind === "district" ? "Edit District" : "Edit Chiefdom"}
            </DialogTitle>
            <DialogDescription>
              {editTarget?.kind === "chiefdom" && (
                <span className="text-muted-foreground">
                  District: <strong>{editTarget.districtName}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div>
              <Label htmlFor="edit-name" className="text-xs font-semibold">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Status</Label>
              <div className="mt-1 flex gap-2">
                {(["active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      editStatus === s
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {editStatus === s ? (
                      <Check className="size-3.5" />
                    ) : s === "inactive" ? (
                      <ShieldOff className="size-3.5" />
                    ) : (
                      <Check className="size-3.5 opacity-0" />
                    )}
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {editLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add District Dialog ───────────────────────────────────────── */}
      <Dialog open={showAddDistrict} onOpenChange={setShowAddDistrict}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New District</DialogTitle>
            <DialogDescription>
              Create a new district in the Sierra Leone geographic registry.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Label htmlFor="new-district-name" className="text-xs font-semibold">District Name</Label>
            <Input
              id="new-district-name"
              value={newDistrictName}
              onChange={(e) => setNewDistrictName(e.target.value)}
              placeholder="e.g. Bombali"
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleAddDistrict()}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDistrict(false); setNewDistrictName("") }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddDistrict}
              disabled={addDistrictLoading || !newDistrictName.trim()}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {addDistrictLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create District
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Chiefdom Dialog ───────────────────────────────────────── */}
      <Dialog
        open={showAddChiefdom}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddChiefdom(false)
            setNewChiefdomName("")
            setAddChiefdomDistrict(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Chiefdom</DialogTitle>
            <DialogDescription>
              {addChiefdomDistrict ? (
                <>
                  Adding chiefdom to <strong>{addChiefdomDistrict.name}</strong> District.
                </>
              ) : (
                "Select a district and enter the chiefdom name."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {!addChiefdomDistrict && (
              <div>
                <Label className="text-xs font-semibold">District</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {districts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setAddChiefdomDistrict(d)}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-muted/50 transition-colors"
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="new-chiefdom-name" className="text-xs font-semibold">Chiefdom Name</Label>
              <Input
                id="new-chiefdom-name"
                value={newChiefdomName}
                onChange={(e) => setNewChiefdomName(e.target.value)}
                placeholder="e.g. Biriwa"
                className="mt-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddChiefdom()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setShowAddChiefdom(false); setNewChiefdomName(""); setAddChiefdomDistrict(null) }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddChiefdom}
              disabled={addChiefdomLoading || !newChiefdomName.trim() || !addChiefdomDistrict}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {addChiefdomLoading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add Chiefdom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
