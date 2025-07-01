export interface Rule {
  _id: string
  name: string
  enabled: boolean
  conditions: Record<string, any>
  score: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  country: string
  timestamp: string
  matchedRuleIds: string[]
  cumulativeScore: number
  executionTrace: ExecutionTrace[]
}

export interface ExecutionTrace {
  ruleId: string
  matched: boolean
  details: Record<string, any>
}

export interface TransactionFilter {
  searchTerm?: string
  country?: string
  scoreRange?: { min: number; max: number }
  timeWindow?: string
  ruleId?: string
}
