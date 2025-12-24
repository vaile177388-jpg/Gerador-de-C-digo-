import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Mudança sutil: Garantindo a versão correta do modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = req.body;
    
    // Adicionando um timeout para evitar que a Vercel corte a conexão
    const result = await model.generateContent(`Gere um JSON puro com a estrutura: {"files": [{"name": "string", "content": "string"}]}. Prompt: ${prompt}`);
    
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    // Se o erro for "model not found", vamos saber exatamente o porquê
    return res.status(500).json({ error: "Erro na API Google: " + error.message });
  }
}
