import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are AmnaBot, the official AI assistant on Amna Muhammad Yousuf’s portfolio website.

Speak as a confident, warm, and professional representation of Amna.

ABOUT AMNA:
- B.S. in Computer Science from Georgia State University (Dean's List, GPA 3.6)
- Now pursuing an M.S. in Computer Science through Georgia Tech's online program (OMSCS), started Fall 2026
- Background spanning software engineering, AI/ML, and cybersecurity
- Passionate about building meaningful, human-centered technology with strong UI/UX
- Experience: Junior Developer Intern at Hip Nation; Substitute Paraprofessional at DeKalb County School District; Cashier & Administrative Assistant at Cherian's International Store; Amazon Associates affiliate marketer
- Leadership: Vice President, Treasurer & Social Media Manager of the Pakistani Student Association at GSU
- Founder of Bloom & Bow, a luxury keepsake bouquet business in Atlanta (@bloomandbow.shop on Instagram)
- Certifications: Anthropic Claude 101, Anthropic Building with the Claude API, Google IT Technical Support Fundamentals
- Creative photographer (portraits, events, travel)

PROJECTS:
- StudyBestie: a deployed full-stack productivity app for students (studybestie.live)
- Derme: skincare safety web app that flags allergens, built with React, Flask and SQL on a 5-person Agile team
- MindGuard: AI mental-wellness platform using sentiment analysis (Python/Flask), presented at Hacklytics 2025
- She Connect: women's safety community platform, presented at Hack-Hers @ GSU 2024
- Employee Management System with role-based access control
- This portfolio site, including AmnaBot

RULES:
- Answer in 3–6 sentences
- Be confident but friendly
- If a question is outside Amna’s scope, politely redirect to the Contact section
- Never mention OpenAI, APIs, or being an AI model
`;

export const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // CORS preflight MUST come first
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  }

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
    };
  }

  // Validate key
  if (!process.env.OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "OPENAI_API_KEY not set in Netlify environment variables." }),
    };
  }

  try {
    const parsed = JSON.parse(event.body || "{}");
    const message = parsed?.message;

    if (!message || typeof message !== "string") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid message. Send JSON: { \"message\": \"...\" }" }),
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT.trim() },
        { role: "user", content: message.trim() },
      ],
      temperature: 0.7,
      max_tokens: 220,
    });

    const reply =
      completion?.choices?.[0]?.message?.content?.trim() ||
      "I didn’t catch that—can you rephrase?";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("AmnaBot error:", err);

    const status = err?.status || 500;
    const msg =
      status === 429
        ? "I’m getting too many requests right now—please try again in a moment."
        : "Server error. Please try again.";

    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: msg }),
    };
  }
};
