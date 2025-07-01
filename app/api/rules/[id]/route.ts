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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const ruleIndex = rules.findIndex((r) => r._id === params.id)

    if (ruleIndex === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    rules[ruleIndex] = {
      ...rules[ruleIndex],
      ...body,
      version: rules[ruleIndex].version + 1,
      updatedAt: new Date().toISOString(),
    }

    // In production, this would trigger rule engine reload
    console.log("Rule updated, triggering hot reload...")

    return NextResponse.json(rules[ruleIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ruleIndex = rules.findIndex((r) => r._id === params.id)

    if (ruleIndex === -1) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    rules.splice(ruleIndex, 1)

    // In production, this would trigger rule engine reload
    console.log("Rule deleted, triggering hot reload...")

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
