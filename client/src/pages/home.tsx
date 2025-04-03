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
        transition={{ delay: 1.5 }}
        className="mt-24 flex flex-col items-center gap-4"
      >
        <Button
          size="lg"
          onClick={() => navigate("/auth")}
          className="bg-[#326800] hover:bg-[#264f00] text-white text-xl px-8 py-6 rounded-full shadow-lg"
        >
          <Play className="mr-2 h-6 w-6" />
          Começar
        </Button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <Button
            variant="link"
            onClick={() => navigate("/")}
            className="text-white/90 hover:text-white hover:underline"
          >
            Saiba mais sobre o Gorf
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}