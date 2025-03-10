import { z } from "zod";

// Types para dados do jogo
export interface Player {
  id: string;
  name: string;
  points: number;
  isActive: boolean;
  challengesCompleted: number;
  drinksCompleted: number;
}

export interface GameSettings {
  maxPoints: number;
  currentPlayerId: string | null;
}

export interface CustomGame {
  id: string;
  name: string;
  mode: string;
  intensity: string;
  challenges: string[];
  isAlcoholic: boolean;
}

// Schemas Zod para validação
export const insertPlayerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export const updatePlayerPointsSchema = z.object({
  points: z.number(),
  type: z.enum(["challenge", "drink"]),
});

export const gameSettingsSchema = z.object({
  maxPoints: z.number().min(10).max(1000),
});

export const insertCustomGameSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  mode: z.string(),
  intensity: z.string(),
  challenges: z.array(z.string()),
  isAlcoholic: z.boolean(),
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertCustomGame = z.infer<typeof insertCustomGameSchema>;

export const intensityLevels = ["Leve", "Moderado", "Hard"] as const;
export const gameModes = ["Clássico", "Roleta", "Verdade ou Desafio"] as const;