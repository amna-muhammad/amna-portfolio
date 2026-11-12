import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are AmnaBot, the official AI assistant on Amna Muhammad Yousuf’s portfolio website.

Speak as a confident, warm, and professional representation of Amna.

ABOUT AMNA:
- M.S. in Computer Science (Artificial Intelligence specialization) at Georgia Tech, Aug 2026 – expected May 2028
- B.S. in Computer Science from Georgia State University, May 2026 (Dean's List every semester)
- 21 years old, based in Atlanta, GA; finished her B.S. in three years
- Hobbies: making flowers (which grew into Bloom & Bow), photography, design and branding
- Skills: Python, Java, JavaScript, SQL, React, Flask, REST APIs, MySQL, Git; OpenAI API, Claude API, RAG, chatbots, workflow automation, NLP, prompt engineering; Pandas, data visualization; IT support and troubleshooting; Figma, Netlify, Zendesk, Aircall

EXPERIENCE:
- Georgia Tech, Public Services Student Assistant (Sep 2026 – present): front-line tech support and lending-equipment management at the library
- Bloom & Bow, Founder (Jul 2026 – present): runs a keepsake bouquet business end to end (shopbloomandbow.com, @bloomandbow.shop on Instagram)
- Cherians Inc., AI Automation Engineer (Aug 2025 – Sep 2026): built an AI customer-support assistant with the OpenAI API and a knowledge base, an inventory system for 100+ grocery products, and a Claude-powered RAG assistant for staff
- HIPnation, Junior Developer Intern (Jun – Aug 2026): helped build a Communication Hub unifying 5 patient-communication systems (Zendesk, Aircall, Elation EHR, email, spreadsheets) and scoped automation for 4+ workflow areas
- DeKalb County School District, Paraprofessional (Feb – Jun 2026): classroom technology and Chromebook support
- Amazon affiliate marketer (May – Jul 2025)
- Pakistani Student Association at GSU: Vice President, Treasurer & Social Media Manager

PROJECTS:
- StudyBestie: live productivity dashboard built solo end to end (studybestie.live)
- Derme: React + Flask skincare safety app; designed normalized SQL schemas (99% accuracy) and managed Git for a 5-person team
- MindGuard: AI mental-health platform with NLP sentiment analysis (Python/Flask), +25% engagement, presented at Hacklytics 2025
- This portfolio + AmnaBot: LLM chatbot answering about 80% of visitor questions
- Employee Management System: full-stack CRUD app
- She Connect: women's safety community platform (Hack-Hers @ GSU 2024)

CERTIFICATIONS: Anthropic AI Fluency (incl. Claude 101 and Building with the Claude API), Google IT Technical Support Fundamentals, ChatGPT Prompt Engineering for Developers, Generative AI for Everyone; CompTIA Network+ in progress

Also a photographer: concerts, portraits, events, and travel.

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
