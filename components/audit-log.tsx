"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"
import { useRuleStore } from "@/lib/stores/rule-store"
import { useState } from "react"

export default function AuditLog() {
  const { auditLogs } = useRuleStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    return matchesSearch && matchesAction
  })

  const exportAuditLog = () => {
    const csv = [
      ["Timestamp", "User", "Action", "Details"].join(","),
      ...filteredLogs.map((log) =>
        [new Date(log.timestamp).toISOString(), log.user, log.action, `"${log.details.replace(/"/g, '""')}"`].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      rule_created: "default",
      rule_updated: "secondary",
      rule_deleted: "destructive",
      rule_enabled: "default",
      rule_disabled: "secondary",
      rule_simulated: "outline",
    }
    return <Badge variant={variants[action] || "outline"}>{action.replace("_", " ").toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Audit Log</CardTitle>
          <CardDescription>
            Complete history of rule changes and system activities with user attribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="rule_created">Rule Created</SelectItem>
                <SelectItem value="rule_updated">Rule Updated</SelectItem>
                <SelectItem value="rule_deleted">Rule Deleted</SelectItem>
                <SelectItem value="rule_enabled">Rule Enabled</SelectItem>
                <SelectItem value="rule_disabled">Rule Disabled</SelectItem>
                <SelectItem value="rule_simulated">Rule Simulated</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Audit Log Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="max-w-md truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No audit logs found matching your criteria.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
