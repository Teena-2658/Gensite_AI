const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

export const generateResponse = async (messages) => {
  try {
    // If input is a string, convert to standard message format
    const formattedMessages = typeof messages === "string" 
      ? [{ role: "user", content: messages }] 
      : messages;

    const res = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Gemini 2.0 supports Vision and is very accurate for code
        model: "google/gemini-2.0-flash-001", 
        messages: formattedMessages,
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error("OpenRouter API error: " + err);
    }

    const data = await res.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("❌ generateResponse error:", error.message);
    throw error;
  }
};