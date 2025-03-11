import { useState } from "react";
import { useLocation } from "wouter";
import { auth, googleProvider, getUserProfile } from "@/lib/firebase";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { GorfLogo } from "@/components/GorfLogo";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida';
      case 'auth/weak-password':
        return 'Senha muito fraca';
      case 'auth/user-disabled':
        return 'Usuário desativado';
      case 'auth/user-not-found':
        return 'Usuário não encontrado';
      case 'auth/wrong-password':
        return 'Senha incorreta';
      case 'auth/popup-closed-by-user':
        return 'Login com Google cancelado';
      case 'auth/cancelled-popup-request':
        return 'Operação cancelada';
      default:
        return 'Ocorreu um erro. Tente novamente.';
    }
  };

  const checkUserProfile = async (userId: string) => {
    const profile = await getUserProfile(userId);
    return profile !== null;
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const hasProfile = await checkUserProfile(result.user.uid);
        setLocation(hasProfile ? "/dashboard" : "/onboarding");
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const hasProfile = await checkUserProfile(result.user.uid);
        setLocation(hasProfile ? "/dashboard" : "/onboarding");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setLocation("/onboarding");
      }
    } catch (error: any) {
      console.error("Error with email auth:", error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-12">
          <GorfLogo />
          <p className="text-white/60 text-center mt-4">Bora jogar?</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            {isLogin ? "Bem-vindo" : "Crie sua conta"}
          </h1>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/20 text-white placeholder:text-white/60 border-none"
              disabled={isLoading}
              autoComplete="email"
              enterKeyHint="next"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/20 text-white placeholder:text-white/60 border-none pr-10"
                disabled={isLoading}
                autoComplete={isLogin ? "current-password" : "new-password"}
                enterKeyHint="done"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Carregando..." : (isLogin ? "Entrar" : "Criar Conta")}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full bg-white/10 text-white hover:bg-white/20"
              size="lg"
              disabled={isLoading}
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Continuar com Google
            </Button>
          </div>

          <p className="text-white/80 text-center mt-6">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300"
              disabled={isLoading}
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}