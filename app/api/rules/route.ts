import { type NextRequest, NextResponse } from "next/server"

// Mock database - in production, this would be MongoDB
const rules = [
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
]

export async function GET() {
  return NextResponse.json(rules)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newRule = {
      _id: `rule_${Date.now()}`,
      ...body,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    rules.push(newRule)

    // In production, this would trigger rule engine reload
    console.log("Rule created, triggering hot reload...")

    return NextResponse.json(newRule, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}
