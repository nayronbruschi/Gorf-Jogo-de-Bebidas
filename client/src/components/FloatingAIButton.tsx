import { useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function FloatingAIButton() {
  const [, navigate] = useLocation();

  return (
    <Button
      onClick={() => navigate("/ai-game-creator")}
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-700 shadow-lg flex items-center justify-center p-0 z-50"
    >
      <Sparkles className="w-6 h-6 text-white" />
    </Button>
  );
}
