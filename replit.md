# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Sessions**: express-session

## Artifacts

### FinTech Personal Finance Dashboard (`artifacts/fintech-dashboard`)
Full-stack personal finance dashboard web application.

**Features:**
- User authentication (signup/login/logout) with session cookies
- Dashboard overview: Monthly Salary, Total Expenses, Net Savings, Savings Rate %
- Expense tracker: add/delete expenses by category (Food, Transport, Shopping, Bills, Entertainment, Other)
- Savings Goals: create goals with target amount and months, shows monthly saving required
- Investment Advisory: AI-style spending tips based on expense patterns
- Profile: view/edit user info and monthly salary

**Frontend:** React + Vite at `/` with Recharts for charts, framer-motion for animations, dark fintech theme
**Backend:** Express API at `/api` with PostgreSQL for persistence

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (auth, expenses, savings, profile, dashboard)
│   └── fintech-dashboard/  # React + Vite frontend (preview at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## Database Schema

- **users**: id, name, email, password (sha256 hashed), salary
- **expenses**: id, user_id, description, category, amount, date
- **savings_goals**: id, user_id, goal_name, target_amount, months

## API Routes

- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET /api/expenses` — List user expenses
- `POST /api/expenses` — Create expense
- `DELETE /api/expenses/:id` — Delete expense
- `GET /api/savings` — List savings goals
- `POST /api/savings` — Create savings goal
- `DELETE /api/savings/:id` — Delete savings goal
- `PUT /api/profile/salary` — Update salary
- `GET /api/dashboard` — Get dashboard summary
