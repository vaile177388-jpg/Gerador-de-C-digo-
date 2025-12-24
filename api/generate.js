import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Usando explicitamente o 1.5-flash (mais estável no grátis)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = req.body.prompt;
    
    // Instrução simplificada para não confundir a IA
    const result = await model.generateContent(`Gere um JSON: {"files": [{"name": "index.html", "content": "html code"}]}. Prompt: ${prompt}`);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    // Se o erro for de modelo (Pro vs Flash), ele aparecerá no seu alerta do celular
    return res.status(500).json({ error: "Erro no Google: " + error.message });
  }
}
