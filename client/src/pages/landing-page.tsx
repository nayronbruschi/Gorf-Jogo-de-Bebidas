import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-purple-900 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="md:w-1/2 space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold"
              >
                GORF
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl md:text-2xl"
              >
                O melhor jogo para animar suas festas e reuniões!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="bg-[#326800] hover:bg-[#264f00] text-white mt-4 text-xl px-8 py-6 rounded-full shadow-lg"
                  onClick={() => navigate("/auth")}
                >
                  <Play className="mr-2 h-6 w-6" />
                  JOGAR
                </Button>
              </motion.div>
            </div>
            <div className="md:w-1/2">
              <motion.img 
                src="/api/images/LOGOGORF.png"
                alt="Gorf Logo"
                className="w-64 h-64 object-contain mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Game Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-purple-900">Jogos Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Modo Clássico */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Modo Clássico</h3>
                <p className="text-gray-600">Desafios aleatórios para todos os jogadores. Faça ou beba!</p>
              </div>
            </motion.div>

            {/* Roleta */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Roleta</h3>
                <p className="text-gray-600">Gire a roleta e descubra seu destino! Quem será o próximo?</p>
              </div>
            </motion.div>

            {/* Verdade ou Desafio */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Verdade ou Desafio</h3>
                <p className="text-gray-600">O clássico jogo de festas agora em formato digital!</p>
              </div>
            </motion.div>

            {/* Eu Nunca */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Eu Nunca</h3>
                <p className="text-gray-600">Descubra segredos dos seus amigos com perguntas provocativas!</p>
              </div>
            </motion.div>

            {/* Desenha e Bebe */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Desenha e Bebe</h3>
                <p className="text-gray-600">Mime ou desenhe e faça os outros adivinharem ou beba!</p>
              </div>
            </motion.div>

            {/* Qual Meu Nome */}
            <motion.div 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              whileHover={{ y: -5 }}
            >
              <div className="bg-purple-800 h-3"></div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-purple-900">Qual Meu Nome</h3>
                <p className="text-gray-600">Adivinhe o nome na sua testa através de dicas dos amigos!</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-purple-700 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar a diversão?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Reúna seus amigos, pegue uma bebida e embarque nessa aventura cheia de diversão e desafios!</p>
          
          <Button 
            size="lg" 
            className="bg-[#326800] hover:bg-[#264f00] text-white text-xl px-8 py-6 rounded-full shadow-lg"
            onClick={() => navigate("/auth")}
          >
            <Play className="mr-2 h-6 w-6" />
            JOGAR AGORA
          </Button>
        </div>
      </section>

      {/* Floating Play Button (visible on scroll) */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button 
          size="lg" 
          className="bg-[#326800] hover:bg-[#264f00] text-white rounded-full h-16 w-16 shadow-lg flex items-center justify-center"
          onClick={() => navigate("/auth")}
        >
          <Play className="h-8 w-8" />
        </Button>
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="/api/images/LOGOGORF.png" alt="Gorf Logo" className="h-12" />
            </div>
            <div className="text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} GORF - Todos os direitos reservados</p>
              <p className="text-sm text-gray-400 mt-2">
                <a href="/politica_privacidade.html" className="hover:text-white">Política de Privacidade</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}