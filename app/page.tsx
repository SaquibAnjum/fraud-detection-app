"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Shield, AlertTriangle, TrendingUp, LogOut, User } from "lucide-react"
import RuleConsole from "@/components/rule-console"
import TransactionFeed from "@/components/transaction-feed"
import RuleSimulator from "@/components/rule-simulator"
import TransactionAnalytics from "@/components/transaction-analytics"
import AuditLog from "@/components/audit-log"
import AuthGuard from "@/components/auth-guard"
import { useRuleStore } from "@/lib/stores/rule-store"
import { useTransactionStore } from "@/lib/stores/transaction-store"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function FraudDetectionPlatform() {
  const { rules } = useRuleStore()
  const { transactions, stats } = useTransactionStore()
  const { user, logout } = useAuthStore()

  const activeRules = rules.filter((rule) => rule.enabled).length
  const totalTransactions = transactions.length
  const highRiskTransactions = transactions.filter((t) => t.cumulativeScore > 70).length
  const avgScore =
    transactions.length > 0
      ? Math.round(transactions.reduce((sum, t) => sum + t.cumulativeScore, 0) / transactions.length)
      : 0

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Live Fraud Detection Platform
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Real-time transaction monitoring and intelligent rule management
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{user?.name}</span>
                <Badge variant={user?.role === "admin" ? "default" : "secondary"}>{user?.role}</Badge>
              </div>
              <Button variant="outline" onClick={logout} className="shadow-sm bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Rules</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{activeRules}</div>
                <p className="text-xs text-blue-600 dark:text-blue-400">{rules.length - activeRules} disabled</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Transactions</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">{totalTransactions}</div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {stats.transactionsPerSecond.toFixed(1)}/sec
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">High Risk</CardTitle>
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-900 dark:text-red-100">{highRiskTransactions}</div>
                <p className="text-xs text-red-600 dark:text-red-400">Score {">"} 70</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Avg Risk Score
                </CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{avgScore}</div>
                <Badge variant={avgScore > 50 ? "destructive" : "secondary"} className="mt-1">
                  {avgScore > 50 ? "High" : "Normal"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Main Interface */}
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-1">
              <TabsTrigger value="transactions" className="rounded-lg">
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="rules" className="rounded-lg">
                Rules
              </TabsTrigger>
              <TabsTrigger value="simulator" className="rounded-lg">
                Simulator
              </TabsTrigger>
              <TabsTrigger value="audit" className="rounded-lg">
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionFeed />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <TransactionAnalytics />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <RuleConsole />
            </TabsContent>

            <TabsContent value="simulator" className="space-y-6">
              <RuleSimulator />
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditLog />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  )
}
