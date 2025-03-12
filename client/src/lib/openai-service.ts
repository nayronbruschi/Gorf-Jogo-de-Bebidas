import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface GameRules {
  name: string;
  description: string;
  players: {
    min: number;
    max: number;
  };
  duration: string;
  rules: string[];
  materials: string[];
}

export async function generateGameRules(prompt: string): Promise<GameRules> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: "You are a creative game designer. Generate fun and engaging drinking game rules based on the user's preferences. Return the response in JSON format with the following structure: { name: string, description: string, players: { min: number, max: number }, duration: string, rules: string[], materials: string[] }"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("Resposta vazia da API");
    }

    return JSON.parse(response.choices[0].message.content) as GameRules;
  } catch (error: any) {
    console.error("Error generating game rules:", error);

    // Mensagens de erro mais específicas
    if (error?.error?.type === "insufficient_quota") {
      throw new Error("Limite de requisições da API atingido. Por favor, tente novamente mais tarde.");
    } else if (error?.error?.type === "invalid_request_error") {
      throw new Error("Requisição inválida. Por favor, tente com uma descrição diferente.");
    } else if (error.message.includes("JSON")) {
      throw new Error("Erro ao processar a resposta. Por favor, tente novamente.");
    }

    throw new Error("Não foi possível gerar as regras do jogo. Por favor, tente novamente mais tarde.");
  }
}