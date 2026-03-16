# Workspace

## Overview

pnpm workspace monorepo. Frontend uses vanilla HTML/CSS/JS served by Flask (Python). Backend API uses Express/Node.js with PostgreSQL.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **Frontend**: Vanilla HTML, CSS, JavaScript + Flask (Python 3.11) file server
- **API framework**: Express 5 (Node.js)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Build**: esbuild (CJS bundle for API server)
- **Sessions**: express-session

## Artifacts

### FinTech Personal Finance Dashboard (`artifacts/fintech-dashboard`)
Full-stack personal finance dashboard web application.

**Features:**
- User authentication (signup/login/logout) with session cookies
- Dashboard overview: Monthly Salary, Total Expenses, Net Savings, Savings Rate % with Chart.js doughnut chart
- Expense tracker: add/delete expenses by category (Food, Transport, Shopping, Bills, Entertainment, Other)
- Savings Goals: create goals with target amount and months, shows monthly saving required
- Investment Advisory: personalised spending tips generated client-side from expense data + user profile inputs
- Profile: view/edit user info and monthly salary

**Frontend:** Vanilla HTML/CSS/JS at `/` served by Flask (`server.py`). No TypeScript, no React, no build step.
**Backend:** Express API at `/api` with PostgreSQL for persistence.

### Frontend Structure (`artifacts/fintech-dashboard/`)
```text
server.py            # Flask Python server — serves all HTML/CSS/JS files
css/style.css        # Dark fintech theme (CSS variables, sidebar, cards, forms, tables, badges)
js/utils.js          # Shared: initApp(), apiFetch(), sidebar injection, auth check, toast
login.html           # Login page (no sidebar)
js/login.js
signup.html          # Signup page (no sidebar)
js/signup.js
dashboard.html       # Dashboard with stats + Chart.js spending breakdown
js/dashboard.js
expenses.html        # Expense list + add/delete form
js/expenses.js
savings.html         # Savings goals grid + create form
js/savings.js
advisory.html        # Two-column: profile form (left) + plan cards (right)
js/advisory.js
profile.html         # Account info + salary update form
js/profile.js
```

## Structure

```text
artifacts/
├── api-server/         # Express API (auth, expenses, savings, profile, dashboard)
├── fintech-dashboard/  # Flask-served HTML/CSS/JS frontend (preview at /)
└── mockup-sandbox/     # Vite preview server for canvas mockups
lib/
├── api-spec/           # OpenAPI spec
├── api-client-react/   # Generated React Query hooks (used internally by api-server tooling)
├── api-zod/            # Generated Zod schemas
└── db/                 # Drizzle ORM schema + DB connection
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
- `GET /api/dashboard` — Get dashboard summary (salary, totalExpenses, netSavings, savingsRate, recentExpenses)
