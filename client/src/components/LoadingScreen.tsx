import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Beer } from "lucide-react";

const loadingPhrases = [
  "Preparando os drinks... 🍹",
  "Enchendo os copos... 🥃",
  "Colocando o gelo... 🧊",
  "Agitando o cocktail... 🍸",
  "Abrindo as cervejas... 🍺",
  "Chamando o garçom... 👋",
  "Pegando as fichas do bar... 🎯",
  "Limpando a mesa de sinuca... 🎱",
  "Aquecendo a festa... 🎉",
  "Testando o som... 🎵"
];

export function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((current) => (current + 1) % loadingPhrases.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-purple-800 flex flex-col items-center justify-center">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="mb-8"
      >
        <Beer className="w-12 h-12 text-white" />
      </motion.div>

      <motion.div
        key={phraseIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="text-xl text-white text-center"
      >
        {loadingPhrases[phraseIndex]}
      </motion.div>
    </div>
  );
}
