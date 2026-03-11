const extractJson = (text) => {

  try {

    if (!text) return null;

    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    return JSON.parse(match[0]);

  } catch (error) {

    console.error("JSON parse error:", error);
    return null;

  }

};

export default extractJson;