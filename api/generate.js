import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = req.body.prompt;
    const result = await model.generateContent(`Gere um JSON puro com esta estrutura: {"files": [{"name": "index.html", "content": "..."}]}. Não use markdown ou explicações. Requisito: ${prompt}`);
    
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, "").trim();

    // Se a IA falhar no JSON, criamos um manualmente para não dar erro 500
    try {
      return res.status(200).json(JSON.parse(text));
    } catch (e) {
      return res.status(200).json({
        files: [{ name: "error.txt", content: "A IA não gerou um JSON válido. Resposta bruta: " + text }]
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
