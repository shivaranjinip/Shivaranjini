# ExpensePro - Personal Expenses Tracker & AI Finance Analyst
> **BCA Final Year Project**  
> A high-performance, full-stack Personal Finance and Expense Tracking application built with React, Vite, Node.js, Express, and Google Gemini 3.5 AI.

---

## 🌟 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [Pre-requisites](#-pre-requisites)
5. [How to Run in Visual Studio Code (Step-by-Step)](#-how-to-run-in-visual-studio-code-step-by-step)
6. [Configuring the Gemini AI Analyst](#-configuring-the-gemini-ai-analyst)
7. [Building for Production and Deployment](#-building-for-production-and-deployment)
8. [Project Structure for Presentations](#-project-structure-for-presentations)

---

## 📊 Project Overview
**ExpensePro** is a modern personal finance manager designed to help users take control of their finances. Unlike static money loggers, ExpensePro incorporates a full-stack **Gemini AI Financial Analyst** using the server-side `@google/genai` SDK to evaluate users' actual transactions, budget targets, and savings goals dynamically, yielding personalized, highly tactical, and numeric suggestions for financial expansion.

---

## ⚡ Key Features
- **Dashboard Summary Analytics**: Dynamic high-contrast cards tracking *Current Balance*, *Total Incomes*, *Total Expenses*, and *Saved Reserves in Goals*.
- **Interactive Visualizations (Recharts)**:
  - Douthnut Pie Chart representing *Expense Allocation shares* by category.
  - Double Grouped Bar Chart highlighting monthly *Net Cashflow trends* (Incomes vs Expenses).
- **Comprehensive Financial Ledger**: Includes full-text query searching, category filters, chronological sorting, table pagination, and an instant **CSV Export** downloading mechanism.
- **Dynamic Budgets Manager**: Category-level targets with color-shifting visual bars that turn warning-amber at 80% capacity and pulsed danger-crimson once exceeded.
- **Savings Milestones Tracker**: Define deadlines and targets (e.g. laptop, emergencies) and contribute funds directly block-by-block.
- **Intelligent Gemini Insights**: Secure, server-side API proxy parsing your ledger to formulate advice, warning thresholds, and checked action roadmaps.
- **Persistent Offline Storage**: Smooth client-state synchronization with `localStorage` so records are portable.

---

## 🛠️ Technology Stack
- **Frontend SPA**: React 19 (Hooks/Functional State Engine), TypeScript
- **Styling Utility**: Tailwind CSS v4 (Custom theme definitions & responsive grids)
- **Visual Mapping**: Recharts, Lucide React (Icons)
- **Backend Service**: Express.js (Port `3000`), Node.js, tsx (Typescript execution), and dotenv
- **Artificial Intelligence**: Google Gemini 3.5 API (`@google/genai` SDK CJS bundle integration via `esbuild`)

---

## 📋 Pre-requisites
Before opening this project in Visual Studio Code, ensure the development machine has:
1. **Node.js**: Version `18.x` or higher (includes `npm`). You can download it from [nodejs.org](https://nodejs.org/).
2. **VS Code**: Download and install Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com/).
3. **VS Code Extensions (Recommended)**:
   - *Tailwind CSS IntelliSense* (for visual utility hints)
   - *ESLint* / *Prettier* (for styling formats)

---

## 💻 How to Run in Visual Studio Code (Step-by-Step)

### Step 1: Export the Project from Google AI Studio
1. In the top-right menu of your Google AI Studio Applet workspace, click on the **Export/Settings** button.
2. Select **Export as ZIP** or **Push to GitHub** to retrieve the full codebase container.
3. Extract the downloaded ZIP file to a convenient workspace folder on your desktop (e.g., `C:\BCA-Projects\ExpensePro`).

### Step 2: Open Folder in VS Code
1. Open **Visual Studio Code**.
2. Click **File > Open Folder** (or `Ctrl + O` / `Cmd + O`).
3. Select your extracted `ExpensePro` directory and hit open.

### Step 3: Open terminal and Install Dependencies
1. Open the built-in terminal inside VS Code by hitting ``Ctrl + ` `` (Backtick) or choosing **Terminal > New Terminal** in the top menu.
2. Run the following command to download and build all required node packages:
   ```bash
   npm install
   ```

### Step 4: Configure environment variables (`.env`)
1. In the VS Code file explorer (left rail), find `.env.example`.
2. Rename it to just `.env` or duplicate it as `.env`.
3. Open the `.env` file and replace the placeholder API key with your official Google Gemini API Key:
   ```env
   GEMINI_API_KEY="AIzaSyYourActualAPIKeyHere..."
   ```
   *(To get a free or pay-as-you-go Gemini API Key, visit [aistudio.google.com](https://aistudio.google.com/))*

### Step 5: Start the Full-Stack Server
In your terminal, launch the dev server with:
```bash
npm run dev
```

### Step 6: Preview the Web Application
1. The terminal will log: `ExpensePro server running at http://localhost:3000`.
2. Open your preferred web browser and navigate to:
   ```
   http://localhost:3000
   ```
3. Your app is now running fully locally! Add records, view chart changes, adjust budgets, and ask Gemini for custom financial blueprints!

---

## 🤖 Configuring the Gemini AI Analyst
The core AI modules operate over standard server endpoints. This guarantees that your sensitive **API KEY remains private** on the backend and is never exposed to the client-side browser bundle:
1. When you click **"Let Gemini Audit My Expenses"**, the client issues a secure `POST` request to our local `/api/insights` router in `server.ts`.
2. The server compiles recent ledger nodes, budget alerts, and goals, initializes a GoogleGenAI client, and prompts `gemini-3.5-flash` using strict system instructions.
3. Gemini processes a structured response in application-ready `JSON` format.
4. The client paints the breakdown status with customizable growth checkboxes.

---

## 🏭 Building for Production and Deployment
When submitting this project for your finals or uploading it to a hosting server, compiles everything into a lightweight static build:
1. Run the build script:
   ```bash
   npm run build
   ```
   This will create a compiled, bundle folder `/dist/`:
   - React bundle is optimized and minified.
   - The TypeScript backend `server.ts` is bundled into a self-contained ES5 environment `dist/server.cjs` using high-speed `esbuild`, preventing runtime ES imports errors on production servers.

2. Run the production build locally:
   ```bash
   npm start
   ```

---

## 📂 Project Structure for Presentations
When presenting this codebase to your BCA project examiners, highlight this modular organization:
- `/server.ts` - Main NodeJS Express server holding API endpoints.
- `/src/types.ts` - Unified TypeScript interfaces making states highly type-safe.
- `/src/App.tsx` - Main React entry routing configurations and local state hooks.
- `/src/components/SummaryCards.tsx` - Stat totals display.
- `/src/components/ChartsView.tsx` - Interactive Recharts trend charts.
- `/src/components/TransactionForm.tsx` - Safe recording inputs.
- `/src/components/TransactionList.tsx` - Spreadsheet ledger with CSV exporting.
- `/src/components/BudgetLimits.tsx` - Budget progress tracker.
- `/src/components/SavingsGoalsTracker.tsx` - Savings milestones controller.
- `/src/components/AIInsightsPanel.tsx` - Interactive AI analytics dashboard.
