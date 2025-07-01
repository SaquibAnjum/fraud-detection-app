"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Cell } from "recharts"
import { useTransactionStore } from "@/lib/stores/transaction-store"
import { useMemo } from "react"

export default function TransactionAnalytics() {
  const { transactions } = useTransactionStore()

  const chartData = useMemo(() => {
    const last24Hours = transactions
      .filter((t) => Date.now() - new Date(t.timestamp).getTime() < 24 * 60 * 60 * 1000)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    // Group by hour
    const hourlyData = last24Hours.reduce(
      (acc, transaction) => {
        const hour = new Date(transaction.timestamp).getHours()
        const key = `${hour}:00`

        if (!acc[key]) {
          acc[key] = { time: key, transactions: 0, avgScore: 0, totalScore: 0, highRisk: 0 }
        }

        acc[key].transactions += 1
        acc[key].totalScore += transaction.cumulativeScore
        acc[key].avgScore = Math.round(acc[key].totalScore / acc[key].transactions)
        if (transaction.cumulativeScore > 70) acc[key].highRisk += 1

        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(hourlyData).slice(-12) // Last 12 hours
  }, [transactions])

  const riskDistribution = useMemo(() => {
    const ranges = [
      { range: "0-20", min: 0, max: 20, color: "#10b981" },
      { range: "21-40", min: 21, max: 40, color: "#f59e0b" },
      { range: "41-60", min: 41, max: 60, color: "#f97316" },
      { range: "61-80", min: 61, max: 80, color: "#ef4444" },
      { range: "81-100", min: 81, max: 100, color: "#dc2626" },
    ]

    return ranges.map((range) => ({
      ...range,
      count: transactions.filter((t) => t.cumulativeScore >= range.min && t.cumulativeScore <= range.max).length,
    }))
  }, [transactions])

  const countryStats = useMemo(() => {
    const stats = transactions.reduce(
      (acc, t) => {
        if (!acc[t.country]) {
          acc[t.country] = { country: t.country, transactions: 0, avgScore: 0, totalScore: 0 }
        }
        acc[t.country].transactions += 1
        acc[t.country].totalScore += t.cumulativeScore
        acc[t.country].avgScore = Math.round(acc[t.country].totalScore / acc[t.country].transactions)
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(stats)
      .sort((a: any, b: any) => b.transactions - a.transactions)
      .slice(0, 8)
  }, [transactions])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Trend */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Transaction Volume Trend</CardTitle>
            <CardDescription>Hourly transaction count and average risk score</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                transactions: {
                  label: "Transactions",
                  color: "hsl(var(--chart-1))",
                },
                avgScore: {
                  label: "Avg Risk Score",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="transactions"
                    stroke="var(--color-transactions)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-transactions)", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="var(--color-avgScore)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-avgScore)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Risk Score Distribution */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">Risk Score Distribution</CardTitle>
            <CardDescription>Transaction count by risk score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Transactions",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Country Analysis */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Geographic Risk Analysis</CardTitle>
          <CardDescription>Transaction volume and average risk score by country</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              transactions: {
                label: "Transactions",
                color: "hsl(var(--chart-1))",
              },
              avgScore: {
                label: "Avg Risk Score",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" />
                <YAxis dataKey="country" type="category" width={60} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="transactions" fill="var(--color-transactions)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
