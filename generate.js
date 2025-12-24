import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Verifica se o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;

  // 2. Verifica se o prompt existe
  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório' });
  }

  // 3. Verifica se a chave da API está configurada
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Erro de configuração: Chave da API não encontrada na Vercel.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Instrução rigorosa para a IA não enviar texto extra
    const systemInstruction = "Atue como um gerador de código. Responda APENAS com um objeto JSON válido, sem explicações, sem markdown e sem blocos de código. O formato deve ser: {\"files\": [{\"name\": \"string\", \"content\": \"string\"}]}";

    const result = await model.generateContent(`${systemInstruction}\n\nUser Request: ${prompt}`);
    const response = await result.response;
    let text = response.text();

    // --- CORREÇÃO PRINCIPAL: Limpeza da resposta ---
    // Remove marcações de ```json ou ``` que a IA insiste em colocar
    const cleanText = text.replace(/```json|```/g, "").trim();

    try {
      const jsonResponse = JSON.parse(cleanText);
      return res.status(200).json(jsonResponse);
    } catch (parseError) {
      console.error('Erro ao ler JSON da IA:', text);
      return res.status(500).json({ 
        error: 'A IA enviou um formato inválido. Tente novamente.',
        debug: cleanText 
      });
    }

  } catch (error) {
    console.error('Erro na API Gemini:', error);
    return res.status(500).json({ error: 'Erro ao conectar com a IA: ' + error.message });
  }
}
