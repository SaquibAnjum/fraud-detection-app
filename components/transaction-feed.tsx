"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Filter, Eye, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { useTransactionStore } from "@/lib/stores/transaction-store"
import type { Transaction } from "@/lib/types"

export default function TransactionFeed() {
  const { transactions, filteredTransactions, setFilters, filters } = useTransactionStore()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 })

  useEffect(() => {
    setFilters({
      ...filters,
      searchTerm,
      scoreRange,
    })
  }, [searchTerm, scoreRange])

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge variant="destructive">Critical</Badge>
    if (score >= 60) return <Badge variant="destructive">High</Badge>
    if (score >= 40) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="outline">Low</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const exportTransactions = () => {
    const csv = [
      ["Transaction ID", "User ID", "Amount", "Country", "Risk Score", "Matched Rules", "Timestamp"].join(","),
      ...filteredTransactions.map((t) =>
        [
          t.id,
          t.userId,
          t.amount,
          t.country,
          t.cumulativeScore,
          t.matchedRuleIds.join(";"),
          new Date(t.timestamp).toISOString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Transaction Filters</span>
          </CardTitle>
          <CardDescription>Filter and search through live transaction data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Transaction ID, User ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={filters.country || "all"}
                onValueChange={(value) => setFilters({ ...filters, country: value === "all" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="RU">Russia</SelectItem>
                  <SelectItem value="NG">Nigeria</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-score">Min Risk Score</Label>
              <Input
                id="min-score"
                type="number"
                min="0"
                max="100"
                value={scoreRange.min}
                onChange={(e) => setScoreRange({ ...scoreRange, min: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-score">Max Risk Score</Label>
              <Input
                id="max-score"
                type="number"
                min="0"
                max="100"
                value={scoreRange.max}
                onChange={(e) => setScoreRange({ ...scoreRange, max: Number.parseInt(e.target.value) || 100 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Transaction Feed</span>
              </div>
              <Badge variant="outline">{filteredTransactions.length} transactions</Badge>
              <Button variant="outline" size="sm" onClick={exportTransactions} className="ml-2 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Real-time transaction monitoring with fraud detection results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Matched Rules</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={transaction.cumulativeScore > 70 ? "bg-red-50 dark:bg-red-950/20" : ""}
                  >
                    <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                    <TableCell>{transaction.userId}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.country}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono">{transaction.cumulativeScore}</span>
                        {getRiskBadge(transaction.cumulativeScore)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {transaction.matchedRuleIds.length > 0 ? (
                          <>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <Badge variant="secondary">{transaction.matchedRuleIds.length}</Badge>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Clean</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Transaction Details: {selectedTransaction?.id}</DialogTitle>
            <DialogDescription>Detailed fraud analysis and rule evaluation results</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <span className="font-mono">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">User ID:</span>
                      <span>{selectedTransaction.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">{formatCurrency(selectedTransaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <Badge variant="outline">{selectedTransaction.country}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timestamp:</span>
                      <span>{new Date(selectedTransaction.timestamp).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Risk Score:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg">{selectedTransaction.cumulativeScore}</span>
                        {getRiskBadge(selectedTransaction.cumulativeScore)}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Matched Rules:</span>
                      <span>{selectedTransaction.matchedRuleIds.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {selectedTransaction.cumulativeScore > 70 ? (
                        <Badge variant="destructive">Flagged</Badge>
                      ) : (
                        <Badge variant="outline">Approved</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Execution Trace */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rule Execution Trace</CardTitle>
                  <CardDescription>Detailed evaluation of each rule against this transaction</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {selectedTransaction.executionTrace.map((trace, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{trace.ruleId}</span>
                            <Badge variant={trace.matched ? "destructive" : "outline"}>
                              {trace.matched ? "Matched" : "No Match"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(trace.details, null, 2)}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
