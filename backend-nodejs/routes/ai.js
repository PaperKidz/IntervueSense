// backend-nodejs/routes/ai.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

// Resolve directory (ensures correct .env path)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Explicitly load .env from backend-nodejs directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const router = express.Router();

// ✅ Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OpenAI API key. Please set OPENAI_API_KEY in .env");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Define Mongoose Schema
const aiResponseSchema = new mongoose.Schema({
  prompt: String,
  response: String,
  createdAt: { type: Date, default: Date.now },
});

const AIResponse = mongoose.model("AIResponse", aiResponseSchema);

// ✅ Test route
router.get("/", (req, res) => {
  res.json({ message: "AI routes active ✅" });
});

// ✅ POST /generate → get AI response + store in DB
router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    // Generate response from OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const aiText = completion.choices[0].message.content;

    // Save in MongoDB
    const newResponse = new AIResponse({ prompt, response: aiText });
    await newResponse.save();

    res.status(200).json({ success: true, data: newResponse });
  } catch (err) {
    console.error("Error in /generate:", err);
    res.status(500).json({ success: false, error: "Failed to generate response" });
  }
});

export default router;
