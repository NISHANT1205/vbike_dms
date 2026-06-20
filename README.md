# DMS · Dealer Management System Dashboard

A modern, enterprise-grade **Dealer Management System** dashboard UI built with **React.js + Vite**, inspired by Zoho Creator and professional ERP applications. Clean, responsive, and role-based.

## ✨ Features

- **Role-based experience** — Super Stockist, Exclusive Dealer, and Sub Dealer each get a tailored dashboard, sidebar, and module set.
- **Collapsible sidebar** with grouped, expandable navigation and active-route highlighting.
- **Top navbar** with global search, notifications, settings, and a user-profile dropdown.
- **Analytics dashboard** — stat cards, sales/purchase trend chart, category split (donut), weekly order volume, plus recent Purchase Orders, Sales Orders, and Inventory Transactions tables.
- **Reusable, config-driven components** — `StatCard`, `Card`, `DataTable` (search + filters + sortable columns + pagination), `Badge`, and chart components.
- **Full module coverage** — Inventory Management, Inventory History (timeline + product-wise), Reports (with PDF/Excel export buttons), Transactions, Dealer Onboarding, Purchase Orders, Sales Orders, Dispatch Management, Query/Support, and Zoho Lead Integration.
- **Breadcrumb navigation**, smooth hover effects, professional blue/green theme, and a fully responsive layout for desktop & tablet.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

> **Login:** Credentials are pre-filled. Just pick a role (Super Stockist / Exclusive Dealer / Sub Dealer) and click **Sign In** to see that role's tailored dashboard and modules.

### Build for production

```bash
npm run build
npm run preview
```

## 🧱 Architecture

The app is **config-driven** so modules scale without bespoke page files:

| File | Responsibility |
|------|----------------|
| `src/data/navigation.js` | Role-based nav trees; routes are generated dynamically from these. |
| `src/data/mockData.js` | Table/form/report/chart/timeline configs + demo data. |
| `src/App.jsx` | Builds React Router routes per role and maps each to a generic page renderer. |
| `src/pages/*` | `Dashboard`, `TablePage`, `FormPage`, `ReportPage`, `TimelinePage`, `Login`, `NotFound`. |
| `src/components/layout/*` | `DashboardLayout`, `Sidebar`, `Header`, `Breadcrumb`. |
| `src/components/ui/*` | `StatCard`, `Card`, `DataTable`, `Badge`, `Charts`, `PageHeader`. |
| `src/context/AuthContext.jsx` | Lightweight role/session state (persisted to localStorage). |

## 🛠 Tech Stack

- React 18 (functional components + hooks)
- React Router 6
- Recharts (analytics charts)
- lucide-react (icons)
- Vite (dev/build)
- Hand-crafted CSS design system (no UI framework dependency)
# vbike_dms
