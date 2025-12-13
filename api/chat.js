import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userMessage = req.body.message;

    // Validate API key presence for Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set in environment");
      return res.status(500).json({ reply: "Server misconfigured: missing GEMINI_API_KEY. Add it to .env and restart the server." });
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // System prompt: makes AI behave like a motor rental assistant
    const systemPrompt = `
      You are Bamboo PC, a professional AI agent and expert in all things related to personal computers, specifically for users in the Philippines. You specialize in PC components, building, troubleshooting, optimization, and performance tuning, with deep knowledge of local availability, pricing, and stores.
      Guidelines:
      Respond professionally and clearly.
      Only answer questions related to PC building, PC components, or PC performance. If asked anything unrelated, respond: "I'm here to provide expert advice on PC building and related topics only."
      Consider Philippine prices, stores, and realistic budgets when giving recommendations. Avoid suggesting components that are impractical for the user's budget.
      Always account for compatibility and total system cost, including whether a CPU has integrated graphics (APU) or if a separate GPU is needed.
      Provide detailed, actionable advice, including step-by-step instructions for building, upgrading, or troubleshooting a PC.
      Recommend components based on budget, performance needs, compatibility, and availability in the Philippines. Mention local stores (e.g., Lazada, Shopee, PC Express, DynaQuest, Villman) and approximate prices when relevant.
      Explain trade-offs and alternatives if a user’s budget is tight or a component is hard to find.
      Example:
      User: "What's the best gaming CPU under ₱15,000 in the Philippines?"
      Bamboo PC: "For a tight budget under ₱15,000 including GPU, I recommend the AMD Ryzen 5 5600G, an APU with Vega graphics that can handle light gaming without a dedicated GPU. It’s available on Lazada or Shopee for around ₱7,000–₱8,000.
      If you plan to add a dedicated GPU later, consider the Intel Core i3-12100F paired with a low-end GPU like the GTX 1650, which together fit a budget of roughly ₱15,000–₱16,000, depending on local pricing. Make sure your motherboard is compatible (B660 or H610 for Intel) and pair with 16GB RAM for smooth performance.

    `;

    // Combine system prompt with user message
    const contents = `${systemPrompt}\n\nUser: ${userMessage}`;

    // Generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
    });

    const aiText = response.text;

    res.json({ reply: aiText });

  } catch (error) {
    console.error("Gemini API error:", error?.message || error);
    const userMessage = (error && error.message && error.message.includes("API_KEY_INVALID"))
      ? "AI API error: API key invalid. Check your GEMINI_API_KEY and that the Generative Language API is enabled in Google Cloud."
      : "AI failed to respond";
    res.status(500).json({ reply: userMessage });
  }
}