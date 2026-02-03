exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Use POST" }),
      };
    }

    const { message, history = [] } = JSON.parse(event.body || "{}");
    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing message" }),
      };
    }

    const system = `
You are "Amna AI" for Amna Yousuf's portfolio website.
Only answer questions about Amna, her background, skills, projects, leadership, photography, and how to contact her.
If asked something unrelated, politely redirect: "I can help with questions about Amna—projects, skills, photography, or contact."
Be friendly, confident, and concise.`;

    const amnaBio = `
Amna Yousuf is a Computer Science student at Georgia State University in Atlanta.
She built a personal portfolio website showcasing technical projects + photography.
Projects include: She Connect (women’s safety platform), Derme (skincare safety idea), Mind Guard (mental health journaling idea), Employee Management System UI.
Leadership: Pakistani Student Association (PSA).
Photography: event + portrait photography showcased on the site.
Contact: via site contact section, LinkedIn, and GitHub links.
`;

    const input = [
      { role: "system", content: system + "\n\nAMNA FACTS:\n" + amnaBio },
      ...history.slice(-8),
      { role: "user", content: message },
    ];

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data }),
      };
    }

    const reply =
      data.output?.[0]?.content?.map((c) => c.text).join("") ||
      "Sorry, I couldn’t generate a reply.";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(e) }),
    };
  }
};
