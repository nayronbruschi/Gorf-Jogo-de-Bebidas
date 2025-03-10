import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { GorfLogo } from "@/components/GorfLogo";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  // Limpar dados dos jogadores ao iniciar o app
  useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <GorfLogo />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="mt-24"
      >
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="bg-white/20 hover:bg-white/30 text-white text-xl px-8 py-6"
        >
          <Play className="mr-2 h-6 w-6" />
          Começar
        </Button>
      </motion.div>
    </div>
  );
}