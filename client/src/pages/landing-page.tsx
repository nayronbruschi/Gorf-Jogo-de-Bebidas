import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Minimal and Modern */}
      <div className="flex-grow flex items-center justify-center bg-gradient-to-b from-purple-600 to-purple-900">
        <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
          <motion.img 
            src="/api/images/LOGOGORF.png"
            alt="Gorf Logo"
            className="w-40 h-40 md:w-56 md:h-56 object-contain mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
          />
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            GORF
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/90 max-w-2xl mb-12"
          >
            O melhor jogo para animar suas festas e reuniões!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="w-full max-w-sm"
          >
            <Button 
              size="lg" 
              className="bg-[#326800] hover:bg-[#264f00] text-white text-2xl px-10 py-8 rounded-full shadow-xl w-full"
              onClick={() => navigate("/auth")}
            >
              <Play className="mr-3 h-8 w-8" />
              JOGAR AGORA
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Footer - Minimal */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} GORF - Todos os direitos reservados | 
            <a href="/politica_privacidade.html" className="hover:text-white ml-1">Política de Privacidade</a>
          </p>
        </div>
      </footer>
    </div>
  );
}