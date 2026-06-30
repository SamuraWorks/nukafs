"use client"

import { useState } from "react"
import { Search, Plus, Edit2, PowerOff, Power } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// Mock Data
const MOCK_DATA = {
  universities: [
    { id: "1", name: "University of Sierra Leone (USL)", status: "active" },
    { id: "2", name: "Njala University (NU)", status: "active" },
    { id: "3", name: "Ernest Bai Koroma University (EBKUST)", status: "active" },
    { id: "4", name: "Milton Margai Technical University", status: "inactive" },
  ],
  campuses: [
    { id: "1", name: "Fourah Bay College", parent: "USL", status: "active" },
    { id: "2", name: "IPAM", parent: "USL", status: "active" },
    { id: "3", name: "COMAHS", parent: "USL", status: "active" },
    { id: "4", name: "Njala Mokonde", parent: "NU", status: "active" },
  ],
  faculties: [
    { id: "1", name: "Faculty of Engineering", status: "active" },
    { id: "2", name: "Faculty of Arts", status: "active" },
    { id: "3", name: "Faculty of Science", status: "active" },
  ],
  departments: [
    { id: "1", name: "Electrical Engineering", parent: "Faculty of Engineering", status: "active" },
    { id: "2", name: "Computer Science", parent: "Faculty of Science", status: "active" },
  ],
  courses: [
    { id: "1", name: "BSc Computer Science", parent: "Computer Science", status: "active" },
    { id: "2", name: "BEng Electrical Engineering", parent: "Electrical Engineering", status: "active" },
  ],
  levels: [
    { id: "1", name: "Year 1", status: "active" },
    { id: "2", name: "Year 2", status: "active" },
    { id: "3", name: "Year 3", status: "active" },
    { id: "4", name: "Year 4", status: "active" },
    { id: "5", name: "Graduate / Alumni", status: "active" },
  ]
}

export default function RegistryDataPage() {
  const [activeTab, setActiveTab] = useState("universities")
  const [searchQuery, setSearchQuery] = useState("")

  const getActiveData = () => {
    return MOCK_DATA[activeTab as keyof typeof MOCK_DATA] || []
  }

  const filteredData = getActiveData().filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toast.success(`Item ${currentStatus === "active" ? "deactivated" : "activated"} successfully.`)
  }

  const handleEdit = (id: string) => {
    toast.info("Edit modal would open here.")
  }

  const handleAdd = () => {
    toast.info(`Add new ${activeTab.slice(0, -1)} modal would open here.`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registry Data</h2>
          <p className="text-muted-foreground">
            Manage global academic reference data used across the application.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4 mr-2" /> Add New Item
        </Button>
      </div>

      <Tabs defaultValue="universities" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto h-auto p-1 flex-wrap">
            <TabsTrigger value="universities">Universities</TabsTrigger>
            <TabsTrigger value="campuses">Campuses</TabsTrigger>
            <TabsTrigger value="faculties">Faculties</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="levels">Academic Levels</TabsTrigger>
          </TabsList>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{activeTab}</CardTitle>
            <CardDescription>
              Any changes made here will automatically reflect in the student registration and profile setup flows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {(activeTab === "campuses" || activeTab === "departments" || activeTab === "courses") && (
                      <TableHead>Parent Category</TableHead>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        {(activeTab === "campuses" || activeTab === "departments" || activeTab === "courses") && (
                          <TableCell className="text-muted-foreground">{item.parent}</TableCell>
                        )}
                        <TableCell>
                          <Badge variant={item.status === "active" ? "default" : "secondary"} className={item.status === "active" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" : ""}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(item.id)}>
                              <Edit2 className="size-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className={`h-8 w-8 ${item.status === "active" ? "text-amber-600" : "text-emerald-600"}`}
                              onClick={() => handleToggleStatus(item.id, item.status)}
                            >
                              {item.status === "active" ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
