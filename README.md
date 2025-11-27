# Kava Life ERP - Frontend

Frontend application for the **Kava Life ERP System**.  
Built with **React.js**, **TypeScript**, **TailwindCSS**, and **Vite**.

## ✨ Tech Stack

- **React.js** (frontend UI framework)
- **TypeScript** (typed JavaScript)
- **Vite** (lightning-fast build tool)
- **TailwindCSS** (utility-first CSS framework)
- **Supabase** (backend, auth, and storage)

## 📦 Project Structure
src/
├── assets/          # Images, logos, static files
├── components/      # Reusable UI components
├── pages/           # Route-based page components
├── services/        # API service handlers (Axios)
├── contexts/        # React context providers (AuthContext etc.)
├── hooks/           # Custom React hooks
├── utils/           # Helper utility functions
├── App.tsx          # Root application component
├── main.tsx         # Entry point
└── index.css        # TailwindCSS imports

## 🚀 Getting Started

Clone the repo:

```bash
git clone https://github.com/yourusername/kavalife-erp-frontend.git
cd kavalife-erp-frontend


Install dependencies: 
npm run dev
Open your browser at http://localhost:5173


🌟 Environment Variables
Create a .env file at the root:
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

🛡 License

This project is licensed under the MIT License.


---

# 🌳 2. Recommended **Branching Strategy**

✅ Here’s a clean, professional flow for 2 people (you + your friend):

| Branch | Purpose |
|:---|:---|
| `main` | Production-ready code only (always deployable) |
| `dev` | Integration branch (latest stable features) |
| `feature/xyz` | Feature-specific branches (short-lived) |
| `hotfix/xyz` | For urgent fixes |

✅ **Workflow**:

- **Start feature**: Create branch from `dev`
  - `git checkout -b feature/add-invoice-upload`
- **Finish feature**: Push and create a Pull Request (PR) to `dev`
- **Review and merge** into `dev`
- **Periodically**, `dev` is merged into `main` after testing.

✅ **Command sample**:

```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# After finishing
git add .
git commit -m "Feature: your feature description"
git push origin feature/your-feature-name

# Create Pull Request to `dev` branch

```
kavalife-erp-frontend
├─ .eslintrc.cjs
├─ .prettierrc
├─ README.md
├─ __mocks__
│  └─ fileMock.js
├─ eslint.config.js
├─ index.html
├─ jest.config.cjs
├─ jest.setup.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ src
│  ├─ api
│  │  ├─ auth.ts
│  │  ├─ bootstrap.ts
│  │  ├─ grn.ts
│  │  ├─ qaqc.ts
│  │  └─ vir.ts
│  ├─ assets
│  │  └─ react.svg
│  ├─ components
│  │  ├─ Header.tsx
│  │  ├─ Sidebar.tsx
│  │  ├─ forms
│  │  │  ├─ ExtractionForm.tsx
│  │  │  ├─ ExtractionFormPage.tsx
│  │  │  ├─ GRNFormModal.tsx
│  │  │  ├─ PurificationForm.tsx
│  │  │  ├─ PurificationFormPage.tsx
│  │  │  ├─ QAQCModal.tsx
│  │  │  ├─ StrippingForm.tsx
│  │  │  ├─ StrippingFormPage.tsx
│  │  │  └─ VIRFormModal.tsx
│  │  ├─ layouts
│  │  │  └─ DashboardLayout.tsx
│  │  ├─ protected
│  │  │  └─ ProtectedLayout.tsx
│  │  └─ ui
│  │     ├─ ExtractionCard.tsx
│  │     ├─ GRNCard.tsx
│  │     ├─ Loader.tsx
│  │     ├─ PurificationCard.tsx
│  │     ├─ StrippingCard.tsx
│  │     ├─ Tooltip.tsx
│  │     ├─ VIRCard.tsx
│  │     ├─ button.tsx
│  │     ├─ sheet.tsx
│  │     └─ task-card.tsx
│  ├─ contexts
│  │  ├─ AuthContext.tsx
│  │  └─ AuthProvider.tsx
│  ├─ hooks
│  │  └─ useAuthContext.ts
│  ├─ index.css
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ Login.tsx
│  │  └─ dashboard
│  │     ├─ Extraction.tsx
│  │     ├─ GoodsReceivedNote.tsx
│  │     ├─ Home.tsx
│  │     ├─ Inventory.tsx
│  │     ├─ Purification.tsx
│  │     ├─ Stripping.tsx
│  │     ├─ Tasks.tsx
│  │     └─ VehicleInspection.tsx
│  ├─ routes
│  │  └─ AppRouter.tsx
│  ├─ services
│  │  └─ supabaseClient.ts
│  ├─ store
│  │  └─ bootstrap.ts
│  ├─ styles
│  ├─ test
│  │  └─ GIRformmodal.test.tsx
│  ├─ types
│  │  ├─ bootstrap.ts
│  │  ├─ grn.ts
│  │  ├─ user.ts
│  │  └─ vir.ts
│  ├─ utils
│  │  ├─ utils.ts
│  │  └─ virMappers.ts
│  └─ vite-env.d.ts
├─ tailwind.config.js
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ tsconfig.test.json
├─ vercel.json
└─ vite.config.ts

```