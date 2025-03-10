import { useState } from "react";
import { useLocation } from "wouter";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setLocation("/game-modes");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Erro ao fazer login com Google");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setLocation("/game-modes");
    } catch (error) {
      console.error("Error with email auth:", error);
      setError(isLogin ? "Erro ao fazer login" : "Erro ao criar conta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
          </h1>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 text-white placeholder:text-white/60 border-none"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/20 text-white placeholder:text-white/60 border-none"
            />

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-white text-purple-600 hover:bg-white/90"
              size="lg"
            >
              {isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full bg-white text-gray-800 hover:bg-white/90"
              size="lg"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Continuar com Google
            </Button>
          </div>

          <p className="text-white text-center mt-6">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white underline hover:text-white/80"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
