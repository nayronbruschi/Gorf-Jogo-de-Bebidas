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

// User Profile Types
export const genderOptions = ["homem", "mulher", "não-binário"] as const;
export const socialNetworkOptions = ["instagram", "tiktok", "X", "facebook"] as const;
export const drinkOptions = [
  "Cerveja",
  "Vodka",
  "Whisky",
  "Gin",
  "Vinho",
  "Tequila",
  "Rum",
  "Cachaça",
  "Sake",
  "Energético"
] as const;

export interface UserProfile {
  id: string;
  name: string;
  birthDate: string;
  gender: typeof genderOptions[number];
  favoriteSocialNetwork: typeof socialNetworkOptions[number];
  favoriteDrinks: Array<typeof drinkOptions[number]>;
  createdAt: string;
  updatedAt: string;
  gameStats: UserGameStats;
}

export interface UserGameStats {
  userId: string;
  lastGamePlayed: string | null;
  totalGamesPlayed: number;
  victories: number;
  totalPlayTime: number; // in minutes
  lastGameStartTime: string | null;
  recentGames: Array<{
    name: string;
    playedAt: string;
  }>;
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

// Zod Schemas for Validation
export const userProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  birthDate: z.string(),
  gender: z.enum(genderOptions),
  favoriteSocialNetwork: z.enum(socialNetworkOptions),
  favoriteDrinks: z.array(z.enum(drinkOptions)).min(1, "Escolha pelo menos uma bebida").max(3, "Escolha no máximo 3 bebidas"),
});

export const userGameStatsSchema = z.object({
  lastGamePlayed: z.string().nullable(),
  totalGamesPlayed: z.number(),
  victories: z.number(),
  totalPlayTime: z.number(),
  lastGameStartTime: z.string().nullable()
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertCustomGame = z.infer<typeof insertCustomGameSchema>;
export type InsertUserProfile = z.infer<typeof userProfileSchema>;
export type InsertUserGameStats = z.infer<typeof userGameStatsSchema>;

// Interface para configurações do popup de instalação
export interface InstallPromptConfig {
  enabled: boolean;
  frequency: number; // Em dias
  startDate: string | null; // Data de início da exibição
  endDate: string | null; // Data de término da exibição
}

export const installPromptConfigSchema = z.object({
  enabled: z.boolean(),
  frequency: z.number().min(1).max(30),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export type InsertInstallPromptConfig = z.infer<typeof installPromptConfigSchema>;

export const intensityLevels = ["Leve", "Moderado", "Hard"] as const;
export const gameModes = ["Clássico", "Roleta", "Verdade ou Desafio"] as const;