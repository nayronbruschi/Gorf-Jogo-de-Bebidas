import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { GorfLogo } from "./GorfLogo";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Timer para remover o splash screen após 2 segundos
    const timer = setTimeout(() => {
      setShow(false);
      // Redirecionar para auth após a animação de saída
      setTimeout(() => {
        setLocation("/auth");
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 1.5
            }}
          >
            <GorfLogo size="large" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}