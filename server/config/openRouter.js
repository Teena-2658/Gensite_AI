const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

const model = "deepseek/deepseek-chat";

export const generateResponse = async (prompt) => {

  try {

    const res = await fetch(openRouterUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Return ONLY valid RAW JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      }),
    });

    if (!res.ok) {

      const err = await res.text();
      console.error("❌ OpenRouter API error:", err);

      throw new Error("OpenRouter API error: " + err);
    }

    const data = await res.json();

    if (!data?.choices?.length) {
      throw new Error("Invalid AI response structure");
    }

    return data.choices[0].message.content;

  } catch (error) {

    console.error("❌ generateResponse error:", error.message);
    throw error;

  }

};