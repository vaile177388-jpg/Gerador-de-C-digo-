import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = {
      role: "model",
      parts: [{
        text: "You are a code generator assistant. Always respond with a JSON array of files in this exact format: {\"files\": [{\"name\": \"string\", \"content\": \"string\"}]}. Only include the JSON in your response, no additional text or markdown."
      }]
    };

    const result = await model.generateContent({
      contents: [
        systemInstruction,
        { role: "user", parts: [{ text: prompt }] }
      ]
    });

    const response = result.response;
    const text = response.text();

    // Try to parse the JSON response
    try {
      const jsonResponse = JSON.parse(text);
      return res.status(200).json(jsonResponse);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({ error: 'Failed to generate content' });
  }
}