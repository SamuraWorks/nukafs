"use client"

import { useState } from "react"
import { Check, X, FileSearch, ClipboardEdit } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ProfileUpdateRequestsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-4xl mx-auto">
      <PageHeader
        title="Profile Update Requests"
        description="The approval queue has been retired. Profile edits are now handled directly by members."
      />

      <Card className="border shadow-sm">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Direct profile editing is now enabled for all roles. Please use the Profile Registry editor to update your details immediately.
        </CardContent>
      </Card>
    </div>
  )
}
