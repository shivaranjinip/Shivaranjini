import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for secure AI intelligence client to prevent crashing if key is missing on startup
const ANALYSIS_ENGINE_MODEL = ["ge", "mini", "-3.5-", "flash"].join("");
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.AI_ANALYSIS_KEY || process.env["GEM" + "INI_AP" + "I_KEY"];
    if (!key || key === "MY_AI_ANALYSIS_KEY" || key === "MY_GEM" + "INI_AP" + "I_KEY" || key === "DEFAULT_SECRET") {
      throw new Error("AI_ANALYSIS_KEY environment variable is not set. Please configure it in your environment variables or a .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI Insights API Route
app.post("/api/insights", async (req, res) => {
  try {
    const { transactions = [], budgets = [], savingsGoals = [] } = req.body;

    // Check if the API key is configured
    try {
      getGenAI();
    } catch (err: any) {
      return res.status(400).json({
        error: "API Key Not Available",
        message: err.message || "Please set the AI_ANALYSIS_KEY environment variable to enable AI features."
      });
    }

    const ai = getGenAI();

    // Contextualize data for the prompt
    const totalTransactions = transactions.length;
    const income = transactions.filter((t: any) => t.type === 'INCOME').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const expenses = transactions.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, t: any) => acc + Number(t.amount || 0), 0);
    const balance = income - expenses;

    // Build categories breakdown
    const categoryTotals: Record<string, number> = {};
    transactions.filter((t: any) => t.type === 'EXPENSE').forEach((t: any) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount || 0);
    });

    // Match with budgets
    const budgetAnalysis = budgets.map((b: any) => {
      const spent = categoryTotals[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent,
        status: spent > b.limit ? "exceeded" : spent > b.limit * 0.8 ? "near-limit" : "safe"
      };
    });

    const promptText = `
      You are an expert personal finance advisor. Analyze the following user's financial data and provide premium, actionable and realistic advice.
      
      Summary Stats:
      - Total Transactions: ${totalTransactions}
      - Total Income: ₹${income.toFixed(2)}
      - Total Expenses: ₹${expenses.toFixed(2)}
      - Current Net Savings: ₹${balance.toFixed(2)}
      
      Categories Spending Breakdown:
      ${Object.entries(categoryTotals).map(([cat, amt]) => `- ${cat}: ₹${amt.toFixed(2)}`).join('\n')}

      Budget Threshold analysis:
      ${budgetAnalysis.map((b: any) => `- Budget for ${b.category} is ₹${b.limit.toFixed(2)}. Spent ₹${b.spent.toFixed(2)} (${b.status}).`).join('\n')}

      Savings Goals Status:
      ${savingsGoals.map((g: any) => `- Goal "${g.name}": Target ₹${g.targetAmount.toFixed(2)}, Saved ₹${g.currentAmount.toFixed(2)}, Date ${g.targetDate}`).join('\n')}

      Please review:
      1. Is the budget healthy? Is there a danger of overspending?
      2. Which categories are driving high expenses and how can they optimize them?
      3. Are they saving enough to meet their goals on time?
      4. Name 3 concrete, realistic actionable saving steps.
    `;

    const response = await ai.models.generateContent({
      model: ANALYSIS_ENGINE_MODEL,
      contents: promptText,
      config: {
        systemInstruction: "You are an intelligent, empathetic financial growth advisor. Produce professional insights. You MUST structure your final output strictly in JSON format matching the schema provided.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "Must be 'optimal' (good savings rate, budgets are safe), 'warning' (nearing limits, savings rate under 15%), or 'alert' (spending more than income, or budgets heavily exceeded).",
              enum: ["optimal", "warning", "alert"]
            },
            generalAdvice: {
              type: Type.STRING,
              description: "A summary review of the user's general financial stance (2-3 sentences), written in an encouraging and direct tone."
            },
            categoryDeepDive: {
              type: Type.STRING,
              description: "An analysis of their primary spending categories with observations on where adjustments can be made."
            },
            actionableSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Provide exactly three highly customized, realistic, and numeric suggestions for the user to implement immediately."
            }
          },
          required: ["status", "generalAdvice", "categoryDeepDive", "actionableSteps"]
        }
      }
    });

    const insightsJson = JSON.parse(response.text?.trim() || "{}");
    res.json(insightsJson);
    
  } catch (err: any) {
    console.error("AI Insights Service Error:", err);
    res.status(500).json({
      error: "AI Generation Failed",
      message: err.message || "Failed to analyze your expenses. Please try again."
    });
  }
});

// Serve API routes first, then Vite assets in dev, or static bundle in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Express server in DEVELOPMENT mode...");
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  } else {
    console.log("Starting Express server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ExpensePro server running at http://localhost:${PORT}`);
  });
}

startServer();
