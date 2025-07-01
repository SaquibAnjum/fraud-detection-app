"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, RotateCcw, Download } from "lucide-react"
import { useTransactionStore } from "@/lib/stores/transaction-store"
import { useRuleStore } from "@/lib/stores/rule-store"
import type { Transaction } from "@/lib/types"

interface SimulationResult {
  transaction: Transaction
  originalScore: number
  newScore: number
  matched: boolean
  impact: "increased" | "decreased" | "no-change"
}

export default function RuleSimulator() {
  const { transactions } = useTransactionStore()
  const { addAuditLog } = useRuleStore()
  const [testRule, setTestRule] = useState(`{
  "name": "Test Rule",
  "conditions": {
    "amount": { "$gt": 2000 },
    "country": { "$in": ["US", "CA"] }
  },
  "score": 45
}`)
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runSimulation = async () => {
    setIsRunning(true)
    try {
      const rule = JSON.parse(testRule)
      const historicalData = transactions.slice(0, 100) // Use last 100 transactions

      const results: SimulationResult[] = historicalData.map((transaction) => {
        const originalScore = transaction.cumulativeScore
        let matched = true

        // Simple rule evaluation
        if (rule.conditions.amount) {
          if (rule.conditions.amount.$gt && transaction.amount <= rule.conditions.amount.$gt) matched = false
          if (rule.conditions.amount.$lt && transaction.amount >= rule.conditions.amount.$lt) matched = false
        }

        if (rule.conditions.country) {
          if (rule.conditions.country.$in && !rule.conditions.country.$in.includes(transaction.country)) matched = false
          if (rule.conditions.country.$nin && rule.conditions.country.$nin.includes(transaction.country))
            matched = false
        }

        if (rule.conditions.userId) {
          if (rule.conditions.userId.$regex) {
            const regex = new RegExp(rule.conditions.userId.$regex)
            if (!regex.test(transaction.userId)) matched = false
          }
        }

        const newScore = matched ? Math.min(originalScore + rule.score, 100) : originalScore
        const impact = newScore > originalScore ? "increased" : newScore < originalScore ? "decreased" : "no-change"

        return {
          transaction,
          originalScore,
          newScore,
          matched,
          impact,
        }
      })

      setSimulationResults(results)

      // Log simulation
      addAuditLog({
        action: "rule_simulated",
        details: `Simulated rule "${rule.name}" on ${results.length} transactions`,
        user: "current_user",
      })
    } catch (error) {
      console.error("Simulation error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const exportResults = () => {
    const csv = [
      ["Transaction ID", "User ID", "Amount", "Country", "Original Score", "New Score", "Matched", "Impact"].join(","),
      ...simulationResults.map((result) =>
        [
          result.transaction.id,
          result.transaction.userId,
          result.transaction.amount,
          result.transaction.country,
          result.originalScore,
          result.newScore,
          result.matched,
          result.impact,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rule-simulation-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "increased":
        return <Badge variant="destructive">Risk Increased</Badge>
      case "decreased":
        return <Badge variant="secondary">Risk Decreased</Badge>
      default:
        return <Badge variant="outline">No Change</Badge>
    }
  }

  const stats = {
    totalTested: simulationResults.length,
    matched: simulationResults.filter((r) => r.matched).length,
    increased: simulationResults.filter((r) => r.impact === "increased").length,
    avgImpact:
      simulationResults.length > 0
        ? Math.round(
            simulationResults.reduce((sum, r) => sum + (r.newScore - r.originalScore), 0) / simulationResults.length,
          )
        : 0,
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Rule Simulation Sandbox</CardTitle>
          <CardDescription>
            Test new fraud detection rules against historical transaction data before deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="test-rule">Test Rule (JSON)</Label>
            <Textarea
              id="test-rule"
              value={testRule}
              onChange={(e) => setTestRule(e.target.value)}
              className="font-mono text-sm h-40 bg-gray-50"
              placeholder="Enter your rule JSON here..."
            />
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={runSimulation}
              disabled={isRunning}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <Play className="h-4 w-4 mr-2" />
              {isRunning ? "Running Simulation..." : "Run Simulation"}
            </Button>
            <Button variant="outline" onClick={() => setSimulationResults([])}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
            {simulationResults.length > 0 && (
              <Button variant="outline" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {simulationResults.length > 0 && (
        <>
          {/* Simulation Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-900">{stats.totalTested}</div>
                <p className="text-sm text-blue-600">Transactions Tested</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-900">{stats.matched}</div>
                <p className="text-sm text-green-600">Rule Matches</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-900">{stats.increased}</div>
                <p className="text-sm text-orange-600">Risk Increased</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-900">
                  {stats.avgImpact > 0 ? "+" : ""}
                  {stats.avgImpact}
                </div>
                <p className="text-sm text-purple-600">Avg Score Impact</p>
              </CardContent>
            </Card>
          </div>

          {/* Simulation Results */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Simulation Results</CardTitle>
              <CardDescription>Impact analysis of the test rule on historical transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Original Score</TableHead>
                      <TableHead>New Score</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {simulationResults.slice(0, 20).map((result, index) => (
                      <TableRow key={index} className={result.matched ? "bg-blue-50" : ""}>
                        <TableCell className="font-mono text-sm">{result.transaction.id}</TableCell>
                        <TableCell>${result.transaction.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.transaction.country}</Badge>
                        </TableCell>
                        <TableCell className="font-mono">{result.originalScore}</TableCell>
                        <TableCell className="font-mono font-bold">{result.newScore}</TableCell>
                        <TableCell>{getImpactBadge(result.impact)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
