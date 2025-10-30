import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import { getUsersCollection } from "../config/database.js"; // ✅ Import your native MongoDB

// Resolve directory (ensures correct .env path)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from backend-nodejs directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const router = express.Router();

// ✅ Ensure API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key. Please set OPENAI_API_KEY in .env");
  process.exit(1);
}

// ✅ Initialize OpenAI client
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "AI routes active ✅" });
});

// ✅ POST /api/ai/generate → generic AI text generation
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = completion.choices[0].message.content;

    // ✅ Save to MongoDB using native driver (optional)
    try {
      const usersCollection = getUsersCollection();
      const aiResponsesCollection = usersCollection.s.db.collection('aiResponses');
      
      const newResponse = {
        prompt,
        response: aiText,
        createdAt: new Date()
      };
      
      await aiResponsesCollection.insertOne(newResponse);
      
      res.status(200).json({ success: true, data: newResponse });
    } catch (dbError) {
      console.warn("⚠️ Could not save to database, but AI generation succeeded:", dbError.message);
      // Still return success even if DB save fails
      res.status(200).json({ 
        success: true, 
        data: { prompt, response: aiText, createdAt: new Date() }
      });
    }
  } catch (err) {
    console.error("❌ Error in /generate:", err);
    res.status(500).json({ success: false, error: "Failed to generate response" });
  }
});

// ✅ POST /api/ai/evaluate-answer → evaluate interview answers
router.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: "Both question and answer fields are required",
      });
    }

    const evaluationPrompt = `
      You are an AI interview evaluator.
      Evaluate the following answer to the question.
      Respond in JSON format with fields:
      {
        "score": <number between 0-10>,
        "feedback": "<short constructive feedback>"
      }

      Question: ${question}
      Answer: ${answer}
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: evaluationPrompt }],
      temperature: 0.7,
    });

    const aiText = completion.choices[0].message.content.trim();

    // Try parsing JSON response if possible
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch {
      parsed = { score: null, feedback: aiText };
    }

    res.status(200).json({
      success: true,
      evaluation: parsed,
    });
  } catch (error) {
    console.error("❌ Error in /evaluate-answer:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during evaluation",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;