import { create } from "zustand"
import type { Rule } from "@/lib/types"

interface AuditLog {
  timestamp: string
  user: string
  action: string
  details: string
}

interface RuleStore {
  rules: Rule[]
  loading: boolean
  error: string | null
  auditLogs: AuditLog[]
  addRule: (rule: Omit<Rule, "_id" | "version" | "createdAt" | "updatedAt">) => Promise<void>
  updateRule: (id: string, rule: Partial<Rule>) => Promise<void>
  deleteRule: (id: string) => Promise<void>
  toggleRule: (id: string) => Promise<void>
  fetchRules: () => Promise<void>
  addAuditLog: (log: Omit<AuditLog, "timestamp">) => void
}

export const useRuleStore = create<RuleStore>((set, get) => ({
  rules: [
    {
      _id: "rule_1",
      name: "High Amount Transaction",
      enabled: true,
      conditions: {
        amount: { $gt: 5000 },
      },
      score: 75,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "rule_2",
      name: "Blocked Country Transaction",
      enabled: true,
      conditions: {
        country: { $in: ["RU", "NG", "IR"] },
      },
      score: 90,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "rule_3",
      name: "Rapid Transaction Pattern",
      enabled: false,
      conditions: {
        amount: { $gt: 1000 },
        userId: { $regex: "^user_" },
      },
      score: 60,
      version: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  loading: false,
  error: null,
  auditLogs: [
    {
      timestamp: new Date().toISOString(),
      user: "system",
      action: "rule_created",
      details: "Initial fraud detection rules loaded",
    },
  ],

  addRule: async (ruleData) => {
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      if (!response.ok) throw new Error("Failed to create rule")

      const newRule = await response.json()
      set((state) => ({ rules: [...state.rules, newRule] }))
      get().addAuditLog({ user: "user", action: "rule_created", details: `Rule "${newRule.name}" created` })
    } catch (error) {
      console.error("Error adding rule:", error)
      // For demo purposes, add locally
      const newRule: Rule = {
        _id: `rule_${Date.now()}`,
        ...ruleData,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set((state) => ({ rules: [...state.rules, newRule] }))
      get().addAuditLog({ user: "user", action: "rule_created", details: `Rule "${newRule.name}" created (locally)` })
    }
  },

  updateRule: async (id, ruleData) => {
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ruleData),
      })

      if (!response.ok) throw new Error("Failed to update rule")

      const updatedRule = await response.json()
      set((state) => ({
        rules: state.rules.map((rule) =>
          rule._id === id ? { ...rule, ...updatedRule, updatedAt: new Date().toISOString() } : rule,
        ),
      }))
      const ruleName = get().rules.find((r) => r._id === id)?.name || "Unknown Rule"
      get().addAuditLog({ user: "user", action: "rule_updated", details: `Rule "${ruleName}" updated` })
    } catch (error) {
      console.error("Error updating rule:", error)
      // For demo purposes, update locally
      set((state) => ({
        rules: state.rules.map((rule) =>
          rule._id === id
            ? { ...rule, ...ruleData, version: rule.version + 1, updatedAt: new Date().toISOString() }
            : rule,
        ),
      }))
      const ruleName = get().rules.find((r) => r._id === id)?.name || "Unknown Rule"
      get().addAuditLog({ user: "user", action: "rule_updated", details: `Rule "${ruleName}" updated (locally)` })
    }
  },

  deleteRule: async (id) => {
    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete rule")

      const ruleName = get().rules.find((r) => r._id === id)?.name || "Unknown Rule"
      set((state) => ({ rules: state.rules.filter((rule) => rule._id !== id) }))
      get().addAuditLog({ user: "user", action: "rule_deleted", details: `Rule "${ruleName}" deleted` })
    } catch (error) {
      console.error("Error deleting rule:", error)
      // For demo purposes, delete locally
      const ruleName = get().rules.find((r) => r._id === id)?.name || "Unknown Rule"
      set((state) => ({ rules: state.rules.filter((rule) => rule._id !== id) }))
      get().addAuditLog({ user: "user", action: "rule_deleted", details: `Rule "${ruleName}" deleted (locally)` })
    }
  },

  toggleRule: async (id) => {
    const rule = get().rules.find((r) => r._id === id)
    if (rule) {
      await get().updateRule(id, { enabled: !rule.enabled })
      const ruleName = get().rules.find((r) => r._id === id)?.name || "Unknown Rule"
      get().addAuditLog({
        user: "user",
        action: "rule_toggled",
        details: `Rule "${ruleName}" toggled to ${!rule.enabled}`,
      })
    }
  },

  fetchRules: async () => {
    set({ loading: true })
    try {
      const response = await fetch("/api/rules")
      if (!response.ok) throw new Error("Failed to fetch rules")

      const rules = await response.json()
      set({ rules, loading: false })
    } catch (error) {
      console.error("Error fetching rules:", error)
      set({ loading: false, error: "Failed to fetch rules" })
    }
  },

  addAuditLog: (log) => {
    set((state) => ({
      auditLogs: [
        {
          ...log,
          timestamp: new Date().toISOString(),
        },
        ...state.auditLogs,
      ].slice(0, 1000), // Keep last 1000 logs
    }))
  },
}))
