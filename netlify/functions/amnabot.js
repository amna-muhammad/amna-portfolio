const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Use POST" })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are AmnaBot, a friendly assistant on Amna's portfolio website."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: completion.choices[0].message.content
      })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
