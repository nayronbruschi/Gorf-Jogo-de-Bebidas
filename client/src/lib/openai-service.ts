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
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
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

    return JSON.parse(response.choices[0].message.content) as GameRules;
  } catch (error) {
    console.error("Error generating game rules:", error);
    throw new Error("Não foi possível gerar as regras do jogo. Tente novamente.");
  }
}
