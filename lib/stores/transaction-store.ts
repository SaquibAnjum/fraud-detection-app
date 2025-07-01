import { create } from "zustand"
import type { Transaction } from "@/lib/types"

interface TransactionFilters {
  searchTerm?: string
  country?: string
  scoreRange?: { min: number; max: number }
  timeWindow?: string
}

interface TransactionStats {
  transactionsPerSecond: number
  totalProcessed: number
  averageScore: number
}

interface TransactionStore {
  transactions: Transaction[]
  filteredTransactions: Transaction[]
  filters: TransactionFilters
  stats: TransactionStats
  isConnected: boolean
  setFilters: (filters: TransactionFilters) => void
  addTransaction: (transaction: Transaction) => void
  connectWebSocket: () => void
  disconnectWebSocket: () => void
}

// ──────────────────────────────────────────────────────────
// Helper – centralised filter logic                        │
// (hoisted because it's a regular function declaration)    │
// ──────────────────────────────────────────────────────────
function applyFilters(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  let filtered = transactions

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    filtered = filtered.filter((t) => t.id.toLowerCase().includes(term) || t.userId.toLowerCase().includes(term))
  }

  if (filters.country) {
    filtered = filtered.filter((t) => t.country === filters.country)
  }

  if (filters.scoreRange) {
    filtered = filtered.filter(
      (t) => t.cumulativeScore >= filters.scoreRange!.min && t.cumulativeScore <= filters.scoreRange!.max,
    )
  }

  return filtered
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  filteredTransactions: [],
  filters: {},
  stats: {
    transactionsPerSecond: 0,
    totalProcessed: 0,
    averageScore: 0,
  },
  isConnected: false,

  setFilters: (filters) => {
    set({ filters })
    const { transactions } = get()
    set({ filteredTransactions: applyFilters(transactions, filters) })
  },

  addTransaction: (transaction) => {
    set((state) => {
      const newTransactions = [transaction, ...state.transactions].slice(0, 1000)
      const newFiltered = applyFilters(newTransactions, state.filters)

      // Update stats
      const now = Date.now()
      const recentTransactions = newTransactions.filter((t) => now - new Date(t.timestamp).getTime() < 1000)

      return {
        transactions: newTransactions,
        filteredTransactions: newFiltered,
        stats: {
          transactionsPerSecond: recentTransactions.length,
          totalProcessed: state.stats.totalProcessed + 1,
          averageScore:
            newTransactions.length > 0
              ? Math.round(newTransactions.reduce((sum, t) => sum + t.cumulativeScore, 0) / newTransactions.length)
              : 0,
        },
      }
    })
  },

  connectWebSocket: () => {
    // Mock WebSocket connection with simulated data
    const interval = setInterval(() => {
      const mockTransaction = generateMockTransaction()
      get().addTransaction(mockTransaction)
    }, 100) // 10 transactions per second

    set({ isConnected: true })

    // Store interval ID for cleanup
    ;(window as any).transactionInterval = interval
  },

  disconnectWebSocket: () => {
    if ((window as any).transactionInterval) {
      clearInterval((window as any).transactionInterval)
    }
    set({ isConnected: false })
  },
}))

// Mock transaction generator
const generateMockTransaction = (): Transaction => {
  const countries = ["US", "CA", "UK", "RU", "NG", "DE", "FR", "JP"]
  const userIds = Array.from({ length: 100 }, (_, i) => `user_${i + 1}`)

  const amount = Math.random() * 10000 + 100
  const country = countries[Math.floor(Math.random() * countries.length)]
  const userId = userIds[Math.floor(Math.random() * userIds.length)]

  // Simple rule evaluation simulation
  let score = 0
  const matchedRules: string[] = []
  const executionTrace: any[] = []

  // High amount rule
  if (amount > 5000) {
    score += 75
    matchedRules.push("rule_1")
    executionTrace.push({
      ruleId: "rule_1",
      matched: true,
      details: { amount: true },
    })
  }

  // Blocked country rule
  if (["RU", "NG", "IR"].includes(country)) {
    score += 90
    matchedRules.push("rule_2")
    executionTrace.push({
      ruleId: "rule_2",
      matched: true,
      details: { country: true },
    })
  }

  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount,
    country,
    timestamp: new Date().toISOString(),
    matchedRuleIds: matchedRules,
    cumulativeScore: Math.min(score, 100),
    executionTrace,
  }
}

// Auto-connect on store creation
setTimeout(() => {
  useTransactionStore.getState().connectWebSocket()
}, 1000)
