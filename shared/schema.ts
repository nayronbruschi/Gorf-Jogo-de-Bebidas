import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  challengesCompleted: integer("challenges_completed").default(0),
  drinksCompleted: integer("drinks_completed").default(0),
});

export const gameSettings = pgTable("game_settings", {
  id: serial("id").primaryKey(),
  maxPoints: integer("max_points").default(100),
  currentPlayerId: integer("current_player_id"),
});

export const customGames = pgTable("custom_games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  mode: text("mode").notNull(),
  intensity: text("intensity").notNull(),
  challenges: json("challenges").notNull().$type<string[]>(),
  isAlcoholic: boolean("is_alcoholic").default(true),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
});

export const updatePlayerPointsSchema = z.object({
  points: z.number(),
  type: z.enum(["challenge", "drink"]),
});

export const gameSettingsSchema = z.object({
  maxPoints: z.number().min(10).max(1000),
});

export const insertCustomGameSchema = createInsertSchema(customGames).pick({
  name: true,
  mode: true,
  intensity: true,
  challenges: true,
  isAlcoholic: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;
export type InsertCustomGame = z.infer<typeof insertCustomGameSchema>;
export type CustomGame = typeof customGames.$inferSelect;
export type GameSettings = typeof gameSettings.$inferSelect;

export const intensityLevels = ["Leve", "Moderado", "Hard"] as const;
export const gameModes = ["Clássico", "Roleta", "Verdade ou Desafio"] as const;