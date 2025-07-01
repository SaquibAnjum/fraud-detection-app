"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Play, Pause } from "lucide-react"
import { useRuleStore } from "@/lib/stores/rule-store"
import type { Rule } from "@/lib/types"

export default function RuleConsole() {
  const { rules, addRule, updateRule, deleteRule, toggleRule } = useRuleStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    conditions: '{\n  "amount": { "$gt": 1000 },\n  "country": { "$in": ["US", "CA"] }\n}',
    score: 50,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const conditions = JSON.parse(formData.conditions)
      const ruleData = {
        name: formData.name,
        conditions,
        score: formData.score,
        enabled: true,
      }

      if (editingRule) {
        await updateRule(editingRule._id, ruleData)
        setEditingRule(null)
      } else {
        await addRule(ruleData)
        setIsCreateDialogOpen(false)
      }

      setFormData({
        name: "",
        conditions: '{\n  "amount": { "$gt": 1000 },\n  "country": { "$in": ["US", "CA"] }\n}',
        score: 50,
      })
    } catch (error) {
      console.error("Invalid JSON in conditions:", error)
    }
  }

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule)
    setFormData({
      name: rule.name,
      conditions: JSON.stringify(rule.conditions, null, 2),
      score: rule.score,
    })
  }

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: "Critical", variant: "destructive" as const }
    if (score >= 60) return { label: "High", variant: "destructive" as const }
    if (score >= 40) return { label: "Medium", variant: "secondary" as const }
    return { label: "Low", variant: "outline" as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fraud Detection Rules</h2>
          <p className="text-muted-foreground">Create and manage rules for real-time transaction evaluation</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Fraud Rule</DialogTitle>
              <DialogDescription>Define conditions and risk score for transaction evaluation</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="High Amount Transaction"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">Conditions (JSON)</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  className="font-mono text-sm"
                  rows={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Risk Score (0-100)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Rule</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Rules ({rules.filter((r) => r.enabled).length})</CardTitle>
          <CardDescription>Rules are evaluated in real-time against incoming transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => {
                const riskLevel = getRiskLevel(rule.score)
                return (
                  <TableRow key={rule._id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{rule.score}</span>
                        <Badge variant={riskLevel.variant}>{riskLevel.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule._id)} />
                        <span className={rule.enabled ? "text-green-600" : "text-gray-500"}>
                          {rule.enabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>v{rule.version}</TableCell>
                    <TableCell>{new Date(rule.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleRule(rule._id)}>
                          {rule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteRule(rule._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Rule: {editingRule?.name}</DialogTitle>
            <DialogDescription>Modify rule conditions and risk score</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Rule Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-conditions">Conditions (JSON)</Label>
              <Textarea
                id="edit-conditions"
                value={formData.conditions}
                onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                className="font-mono text-sm"
                rows={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-score">Risk Score (0-100)</Label>
              <Input
                id="edit-score"
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: Number.parseInt(e.target.value) })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button type="submit">Update Rule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
