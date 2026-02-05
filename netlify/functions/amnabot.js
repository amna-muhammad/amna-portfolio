import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are AmnaBot, the official AI assistant on Amna Muhammad Yousuf’s portfolio website.

Speak as a confident, warm, and professional representation of Amna.

ABOUT AMNA:
- Computer Science student at Georgia State University
- Passionate about building meaningful technology
- Strong interest in software engineering, UI/UX, and human-centered design
- Leadership experience in the Pakistani Student Association (PSA)
- Experienced in event planning, sponsorship outreach, and teamwork
- Creative photographer and designer

PROJECTS:
- SheConnect: women-focused safety & support platform
- MindGuard AI: mental wellness support concept
- Derme: skincare & cosmetic ingredient analysis idea
- Personal portfolio showcasing projects, resume, and photography

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
