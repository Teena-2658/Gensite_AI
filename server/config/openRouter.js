import fetch from "node-fetch";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateResponse = async (messages) => {
  try {

    const API_KEY = process.env.OPENROUTER_API_KEY;

    console.log("OPENROUTER KEY:", API_KEY ? "Loaded ✅" : "Missing ❌");

    const formattedMessages =
      typeof messages === "string"
        ? [{ role: "user", content: messages }]
        : messages;

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",

        // REQUIRED headers for OpenRouter
        "HTTP-Referer": "https://gensite-ai.onrender.com",
        "X-Title": "GenSite AI"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",

        messages: formattedMessages,
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API Error:", errorText);
      throw new Error(errorText);
    }

    const data = await response.json();

    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));

    return data?.choices?.[0]?.message?.content || "";

  } catch (error) {
    console.error("❌ generateResponse error:", error.message);
    throw error;
  }
};