# 🚨 Live Fraud Rule Composer & Transaction Explorer

A real-time full-stack application for crafting, managing, and executing JSON-based fraud detection rules. This system allows analysts to create/edit rules on-the-fly, evaluate live transactions in real-time, and explore rule matches with full execution traces.

---

## 🗂️ Project Structure

/fraud-engine-app
├── backend/
│ ├── src/
│ │ ├── index.ts # App entry point
│ │ ├── wsServer.ts # WebSocket server setup
│ │ ├── ruleEngine.ts # Rule evaluation logic
│ │ ├── transactionProcessor.ts # Match transactions with rules
│ │ └── models/
│ │ ├── Rule.ts # Mongoose schema for rules
│ │ └── Transaction.ts # Mongoose schema for transactions
│ ├── routes/
│ │ ├── rules.ts # Rule API routes
│ │ └── transactions.ts # Transaction API routes
│ ├── seed/
│ │ └── seedRules.ts # Seeding script for rules
│ └── .env # Environment config
│
├── frontend/
│ ├── pages/
│ │ ├── index.tsx # Live Transaction Viewer
│ │ ├── rules.tsx # Rule Composer Page
│ ├── components/
│ │ ├── RuleForm.tsx
│ │ ├── TransactionTable.tsx
│ │ ├── TransactionDetail.tsx
│ ├── styles/
│ └── utils/
│ └── websocketClient.ts
│
├── .gitignore
├── README.md
└── package.json


---

## ⚙️ Tech Stack

### 🧠 Backend
- Node.js + TypeScript
- Express.js
- WebSocket (or SSE)
- MongoDB + Mongoose

### 💻 Frontend
- Next.js + TypeScript
- Tailwind CSS
- Zustand (or Redux) for state management
- WebSocket client for live updates

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- VS Code or any preferred IDE

---

### ▶️ Running the Backend

```bash
cd backend
npm install
npm run dev
