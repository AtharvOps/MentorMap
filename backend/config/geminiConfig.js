import dotenv from "dotenv";
dotenv.config();

export const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
export const GEMINI_API_URL = process.env.GOOGLE_GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
