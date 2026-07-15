import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.post("/api/ai/analyze-risk", async (req, res) => {
  try {
    const { 
      customerName, 
      accountNumber, 
      loanAmount, 
      loanPurpose, 
      creditStatus, 
      exemptionReason,
      officerNotes,
      customConditions
    } = req.body;

    if (!exemptionReason || !loanAmount) {
      return res.status(400).json({ error: "Missing required fields: loanAmount and exemptionReason." });
    }

    const prompt = `
      You are a Senior Credit Risk Advisor at a major bank. Analyze the following loan exemption request:
      
      CUSTOMER INFORMATION:
      - Name: ${customerName || "N/A"}
      - Account Number: ${accountNumber || "N/A"}
      - Current Credit Status: ${creditStatus || "N/A"}
      
      LOAN DETAILS:
      - Requested Amount: $${Number(loanAmount).toLocaleString()}
      - Purpose: ${loanPurpose || "N/A"}
      
      EXEMPTION REQUEST DETAILS:
      - Reason for requesting exemption: "${exemptionReason}"
      - Credit Officer's Notes/Custom Conditions: "${officerNotes || "N/A"}"
      ${customConditions && customConditions.length > 0 ? `- Officer-Proposed Conditions:\n${customConditions.map((c: any) => `  * ${c.condition} (Expected in ${c.days} days)`).join("\n")}` : ""}

      Please analyze the risk level (LOW, MEDIUM, HIGH), assign a numeric risk score (1-100 where 1 is minimal risk and 100 is extreme risk), write a clear summary analysis, outline mitigation strategies, and recommend condition items for tracking.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an objective, thorough credit risk review model. You evaluate risks critically and provide realistic, actionable credit mitigations and conditions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: {
              type: Type.INTEGER,
              description: "A calculated credit risk score between 1 and 100."
            },
            riskLevel: {
              type: Type.STRING,
              description: "Risk classification: 'LOW', 'MEDIUM', or 'HIGH'."
            },
            summaryAnalysis: {
              type: Type.STRING,
              description: "A professional 2-3 sentence analysis of the credit vulnerability and potential risk exposure."
            },
            mitigations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "At least 3 practical, concrete mitigation measures tailored to this specific credit scenario."
            },
            recommendedConditions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  condition: { type: Type.STRING, description: "Detailed description of the condition the borrower must fulfill." },
                  expectedTimelineDays: { type: Type.INTEGER, description: "Timeline in days to meet this condition." },
                  followUpAction: { type: Type.STRING, description: "The action for the credit officer to monitor/verify this condition." }
                },
                required: ["condition", "expectedTimelineDays", "followUpAction"]
              }
            }
          },
          required: ["riskScore", "riskLevel", "summaryAnalysis", "mitigations", "recommendedConditions"]
        }
      }
    });

    const dataText = response.text;
    if (!dataText) {
      throw new Error("No text response from Gemini API.");
    }

    const result = JSON.parse(dataText.trim());
    return res.json(result);

  } catch (error: any) {
    console.error("AI Risk Assessment Error:", error);
    return res.status(500).json({ 
      error: "Failed to perform AI risk assessment", 
      details: error.message || error 
    });
  }
});

// Route for generating dynamic summary reports using Gemini API
app.post("/api/ai/generate-report", async (req, res) => {
  try {
    const { exemptions } = req.body; // array of exemptions
    
    if (!exemptions || exemptions.length === 0) {
      return res.json({ 
        reportSummary: "No exemption data available to analyze. Please log exemption requests to generate a portfolio credit summary report." 
      });
    }

    const portfolioPrompt = `
      You are a credit committee director. Review the following active loan exemptions list and draft a Portfolio Risk & Health Report.
      
      ACTIVE EXEMPTIONS LIST:
      ${exemptions.map((ex: any, idx: number) => `
        Exemption #${idx + 1}:
        - Customer: ${ex.customerName} (Acct: ${ex.accountNumber})
        - Amount Approved: $${Number(ex.loanAmount).toLocaleString()}
        - Risk Level: ${ex.riskLevel} (Score: ${ex.riskScore || 'N/A'})
        - Status: ${ex.status}
        - Reason: ${ex.exemptionReason}
        - Pending Conditions: ${ex.conditions ? ex.conditions.filter((c: any) => !c.isMet).map((c: any) => `* ${c.condition}`).join(", ") : "None"}
      `).join("\n")}
      
      Generate a professional executive summary of the portfolio. Detail:
      1. Overall Risk Exposure assessment.
      2. The primary vulnerability trends across these exemptions.
      3. Key oversight recommendations for the credit officers to minimize loss.
      Keep it professional, concise, and structured in clean markdown paragraphs. Do not write markdown tags or headers or code blocks in the response itself, just write a clean summary narrative with sub-bullets.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: portfolioPrompt,
      config: {
        systemInstruction: "You are a Chief Risk Officer. You provide executive-level, analytical credit risk portfolio reports."
      }
    });

    return res.json({ reportSummary: response.text });
  } catch (error: any) {
    console.error("AI Portfolio Report Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate portfolio risk report", 
      details: error.message || error 
    });
  }
});

// Setup Vite Dev Server / Static Files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA Fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

setupServer();
