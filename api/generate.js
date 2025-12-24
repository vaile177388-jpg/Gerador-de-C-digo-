import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave API não configurada' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemInstruction = "Atue como um gerador de código. Responda APENAS com um objeto JSON válido no formato: {\"files\": [{\"name\": \"string\", \"content\": \"string\"}]}. Não use markdown.";

    const result = await model.generateContent(`${systemInstruction}\n\nPedido: ${prompt}`);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json|```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanText);
      return res.status(200).json(jsonResponse);
    } catch (parseError) {
      return res.status(500).json({ error: 'Erro no formato da IA', debug: cleanText });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
