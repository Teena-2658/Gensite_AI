import fetch from "node-fetch";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const generateResponse = async (messages) => {

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: messages, // ✅ FULL CHAT HISTORY
      max_tokens: 4000,   // ✅ SAFE LIMIT
      temperature: 0.7
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "OpenRouter error");
  }

  return data.choices?.[0]?.message?.content || "";
};