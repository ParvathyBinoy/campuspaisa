# CampusPaisa 🎓💰

**CampusPaisa** is a student-first, local-first personal finance and budget management web application tailored specifically for college students in India.

Built with React, TypeScript, Tailwind CSS, and Recharts, CampusPaisa empowers college students to understand where their pocket money and internship stipends come from, track campus living expenses, set smart category budget limits with proactive alerts, build goal envelopes (like saving for an M4 MacBook or a semester trip), and never miss mess or room bills.

---

## ✨ Key Features

### 1. 📊 Overview Dashboard
- **Real-Time Financial Cards:** Total Inflow, Total Outflow, Net Cash Flow, and Remaining Budget.
- **Smart Spending Insights:** Automated advice on highest spending categories and savings rates.
- **Visual Analytics:** Month-by-month Income vs. Expenses comparison bar chart and spending breakdown donut chart using Recharts.
- **Snapshot Widgets:** Budget threshold progress bars, upcoming bills with quick-pay actions, and savings milestone envelopes.
- **Interactive Demo Mode:** Load realistic student data (stipends, canteen lunches, metro cards, mess dues) with one click or reset to empty.

### 2. 💳 Transaction Management (Full CRUD)
- **Categorization:** Pre-configured for Indian student life (Allowances, Canteens, Hostel, Books, Fuel, Recharges, Subscriptions).
- **Payment Methods:** Support for UPI (GPay/PhonePe/Paytm), Cash, Debit Card, Credit Card, and Bank Transfer.
- **Needs vs Wants:** Tag expenses as *Essential* (academics, rent, food) or *Non-Essential* (movies, dining out).
- **Multi-Filter & Search:** Filter by type, category, payment mode, custom date ranges, and search descriptions or tags.
- **CSV Export:** RFC-4180 compliant CSV export with proper quotation escaping for spreadsheet analysis.

### 3. 🎯 Budget Limits & Utilization Warnings
- **Dual Budgeting:** Set both an **Overall Monthly Spending Cap** and **Category-Specific Limits** (e.g. Food, Outings).
- **Threshold Alerts:** Progress bars automatically change color with warnings at **75%**, **90%**, and **100%+ (Over Budget)**.
- **Clear Financial Separation:** Distinct separation between *Remaining Budget* (budget minus expenses) and *Net Cash Flow* (income minus expenses).

### 4. 🏆 Savings Goals & Envelopes
- **Milestone Tracking:** Set target amounts and completion dates for campus milestones (Electronics, Trips, Certifications).
- **Contribution History:** Deposit funds directly from surplus cash with complete deposit logs.
- **Progress Tracking:** Automatic progress percentages, days remaining, and active vs. completed milestone views.

### 5. 🔔 Bills & Due Reminders
- **Recurrence Support:** Manage one-time, weekly, monthly, and yearly recurring dues.
- **Overdue Detection:** Automatic alerts for overdue mess bills, library book renewals, or hostel electricity shares.
- **Safe Paid Linking:** Marking a bill as paid automatically logs an expense transaction without duplicate entries and rolls recurring bills forward to the next cycle.

### 6. 📈 Reports & Analytics
- **Historical Cash Flow Trends:** 6-month comparative trend analysis.
- **Needs vs Wants Ratio:** Track what percentage of your money satisfies survival essentials vs discretionary desires.
- **Payment Method Distribution:** See how much is spent via UPI vs Cash.
- **Category Deep Dive:** Sortable expenditure breakdown table.

### 7. ⚙️ Settings, Offline Backup & Privacy
- **Currency Configuration:** Default Indian Rupee (₹) with Indian Lakhs/Crores formatting (`en-IN`), customizable to USD, EUR, GBP, etc.
- **Theme Modes:** Dark Navy Mode (`#171A35`) and Clean Light Mode.
- **Custom Categories:** Create and edit custom categories with customizable Lucide icons and color swatches. Safe reassignment protection before category deletion.
- **Offline JSON Backups:** Export and restore your complete ledger with schema validation.
- **Privacy First:** 100% client-side storage via browser LocalStorage. Zero trackers, zero ads, and zero server logging.

---

## 🛠️ Technology Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Data Visualizations:** [Recharts](https://recharts.org/)
- **Routing:** [React Router 6](https://reactrouter.com/) (HashRouter for GitHub Pages static compatibility)
- **Data Persistence:** Browser LocalStorage with schema versioning & memory fallback

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd campuspaisa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Run Automated Calculations Tests:**
   ```bash
   npm test
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📂 Project Architecture

```
campuspaisa/
├── public/
│   └── favicon.svg               # Brand coin/wallet icon
├── scripts/
│   └── test-calculations.js     # Automated financial calculation test runner
├── src/
│   ├── components/
│   │   ├── forms/                # Transaction, Budget, Goal, Bill, Category modals
│   │   ├── layout/               # Sidebar, Header, Responsive Layout wrapper
│   │   └── ui/                   # CategoryIcon, StatCard, ProgressBar, Modal, Toasts
│   ├── context/
│   │   └── FinanceContext.tsx    # Centralized financial state & CRUD logic
│   ├── data/
│   │   ├── defaultCategories.ts  # Tailored student income & expense categories
│   │   └── demoData.ts           # Realistic student demo dataset
│   ├── pages/
│   │   ├── Overview.tsx          # Main dashboard with KPIs and Recharts
│   │   ├── Transactions.tsx      # Filterable transaction table with CSV export
│   │   ├── Budgets.tsx           # Category and overall budget progress tracking
│   │   ├── SavingsGoals.tsx      # Target envelopes and deposit logs
│   │   ├── Bills.tsx             # Bills, recurring cycles, and overdue alerts
│   │   ├── Reports.tsx           # Needs vs Wants analytics & trends
│   │   └── Settings.tsx          # JSON backup/restore, currencies, theme
│   ├── services/
│   │   ├── storage.ts            # LocalStorage data access layer
│   │   └── backup.ts             # JSON export, schema validation & restore
│   ├── utils/
│   │   ├── calculations.ts       # Cash flow, category breakdown, budget utilization
│   │   ├── currency.ts           # Indian number system & international currencies
│   │   ├── dates.ts              # DD MMM YYYY formatting & recurrence math
│   │   ├── export.ts             # RFC 4180 CSV export generator
│   │   └── validation.ts         # Form validation helpers
│   ├── types/
│   │   └── index.ts              # Strict TypeScript interfaces
│   ├── App.tsx                   # HashRouter routing setup
│   ├── main.tsx                  # React DOM mount point
│   └── index.css                 # Tailwind CSS & design tokens
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Privacy & Local-First Philosophy

- **Zero Cloud Tracking:** All student financial records reside in your browser's private LocalStorage on this device.
- **No Third-Party APIs:** CampusPaisa requires no registration, API keys, or banking integrations.
- **Easy Backups:** You can download a full JSON copy of your finances under **Settings > Export Full Backup** at any time.

---

## 🌐 Deploying to GitHub Pages

CampusPaisa is pre-configured with relative asset paths (`base: './'`) and `HashRouter`, making it ready for instant deployment to GitHub Pages without 404 routing errors.

### Steps to Deploy:

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial CampusPaisa release"
   git remote add origin https://github.com/<your-username>/campuspaisa.git
   git push -u origin main
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder:
   - You can use the standard GitHub Pages workflow from the `Settings > Pages` tab by setting **Build and deployment** source to **GitHub Actions** (using the standard static Vite template) or deploying the `dist` branch.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
