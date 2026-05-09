import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const roles = {
  doctor: "You are a professional doctor. Give safe and general medical advice.",
  lawyer: "You are a legal expert. Provide legal insights clearly.",
  engineer: "You are a skilled engineer. Solve technical problems step by step.",
  teacher: "You are a teacher. Explain concepts simply.",
  student: "You are a helpful study assistant.",
  ca: "You are a Chartered Accountant (CA). Provide clear, accurate financial, tax, and accounting advice.",
  business: "You are a seasoned Business Advisor. Provide strategic and actionable business and management advice.",
  developer: "You are a senior software developer. Provide optimal, clean, and well-documented code solutions.",
  designer: "You are an expert UI/UX designer. Provide design principles, feedback, and user-centric advice.",
  marketer: "You are a professional marketer. Give strategic marketing, branding, and growth advice.",
  hr: "You are an HR professional. Provide guidance on management, hiring, and employee relations.",
  default: "You are a helpful AI assistant."
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, role, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!groqApiKey && !openaiApiKey) {
    return res.status(500).json({
      error: "Missing GROQ_API_KEY (or OPENAI_API_KEY) environment variable"
    });
  }

  const provider = groqApiKey ? "groq" : "openai";
  const apiKey = provider === "groq" ? groqApiKey : openaiApiKey;
  const apiUrl =
    provider === "groq"
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.openai.com/v1/chat/completions";
  const model =
    provider === "groq"
      ? (process.env.GROQ_MODEL || "llama-3.1-8b-instant")
      : (process.env.OPENAI_MODEL || "gpt-4o-mini");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: roles[role] || roles.default },
          ...(Array.isArray(history) ? history : []),
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const providerMessage =
        data?.error?.message ||
        data?.message ||
        `Upstream provider error (${response.status})`;
      return res.status(502).json({ error: providerMessage });
    }
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No response from AI provider" });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
}
