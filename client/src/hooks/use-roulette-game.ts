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
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [numDrinks, setNumDrinks] = useState(0);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<PunishmentType | null>(null);
  const [action, setAction] = useState<"drink" | "refuse" | null>(null);
  const [punishmentDrinks, setPunishmentDrinks] = useState(0);
  const [showWinner, setShowWinner] = useState(false);

  const [, navigate] = useLocation();
  const { play } = useSound();
  const gameMode = localStorage.getItem("rouletteMode") || "goles";
  const maxPoints = Number(localStorage.getItem("maxPoints")) || 50;

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

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

  const checkAllPlayersForWin = async () => {
    if (!players || players.length === 0) return false;

    for (const player of players) {
      if (player.points >= maxPoints) {
        setShowWinner(true);
        navigate(`/roulette/winner?playerId=${player.id}`);
        return true;
      }
    }
    return false;
  };

  const resetGame = async () => {
    try {
      await apiRequest("POST", "/api/players/reset", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setShowWinner(false);
      navigate("/roulette/play");
    } catch (error) {
      console.error('Erro ao reiniciar jogo:', error);
    }
  };

  const selectRandomPlayer = async () => {
    if (isSelecting || !players.length) return;

    setIsSelecting(true);
    setAction(null);
    setPunishmentDrinks(0);
    play("spin");

    setTimeout(async () => {
      const hasWinner = await checkAllPlayersForWin();
      if (hasWinner) {
        setIsSelecting(false);
        return;
      }

      const remainingPlayers = players.filter(player => !showWinner || player.points < maxPoints);
      if (remainingPlayers.length === 0) {
        setIsSelecting(false);
        return;
      }

      const randomPlayer = remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)];
      const minDrinks = gameMode === "shots" ? 1 : 2;
      const maxDrinks = Number(localStorage.getItem("maxPerRound")) || (gameMode === "shots" ? 5 : 15);
      const randomDrinks = Math.floor(Math.random() * (maxDrinks - minDrinks + 1)) + minDrinks;

      setSelectedPlayer(randomPlayer);
      setNumDrinks(randomDrinks);
      setIsSelecting(false);
      play("success");
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
      players,
      showWinner
    },
    actions: {
      setSelectedPlayer,
      setShowPunishment,
      setCurrentPunishment,
      setAction,
      setPunishmentDrinks,
      selectRandomPlayer,
      updatePoints,
      checkAllPlayersForWin,
      resetGame
    }
  };
}