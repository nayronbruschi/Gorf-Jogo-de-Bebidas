import { useState } from "react";
import { useLocation } from "wouter";
import { useSound } from "./use-sound";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

interface PunishmentType {
  text: string;
  icon: React.ComponentType<any>;
}

export function useRouletteGame() {
  // Game states
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [numDrinks, setNumDrinks] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<PunishmentType | null>(null);
  const [action, setAction] = useState<"drink" | "refuse" | null>(null);
  const [punishmentDrinks, setPunishmentDrinks] = useState(0);

  // Hooks
  const [, navigate] = useLocation();
  const { play } = useSound();
  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const maxPoints = Number(localStorage.getItem("maxPoints"));

  // Queries
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Points mutation
  const updatePoints = useMutation({
    mutationFn: async (data: { playerId: string; points: number }) => {
      const result = await apiRequest("PATCH", `/api/players/${data.playerId}/points`, {
        type: "drink",
        points: data.points
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
    }
  });

  // Check for winner
  const checkAllPlayersForWin = async () => {
    if (!players || players.length === 0) return false;

    for (const player of players) {
      if (player.points >= maxPoints) {
        navigate(`/roulette/winner?playerId=${player.id}`);
        return true;
      }
    }
    return false;
  };

  // Game actions
  const selectRandomPlayer = async () => {
    if (isSelecting || !players.length) return;

    const hasWinner = await checkAllPlayersForWin();
    if (hasWinner) return;

    setIsSelecting(true);
    setAction(null);
    setPunishmentDrinks(0);
    play('spin');

    setTimeout(() => {
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const minDrinks = gameMode === "shots" ? 1 : 2;
      const maxDrinks = Number(localStorage.getItem("maxPerRound")) || (gameMode === "shots" ? 5 : 15);
      const randomDrinks = Math.floor(Math.random() * (maxDrinks - minDrinks + 1)) + minDrinks;

      setSelectedPlayer(randomPlayer);
      setNumDrinks(randomDrinks);
      setIsSelecting(false);
      play('tada');
    }, 2000);
  };

  return {
    gameState: {
      selectedPlayer,
      isSelecting,
      numDrinks,
      showPunishment,
      currentPunishment,
      action,
      punishmentDrinks,
      gameMode,
      maxPoints,
      players
    },
    actions: {
      setSelectedPlayer,
      setShowPunishment,
      setCurrentPunishment,
      setAction,
      setPunishmentDrinks,
      selectRandomPlayer,
      updatePoints,
      checkAllPlayersForWin
    }
  };
}