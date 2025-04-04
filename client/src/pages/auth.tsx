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
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const getErrorMessage = (code: string) => {
    const currentDomain = window.location.host;
    
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Este email já está em uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/operation-not-allowed':
        return 'Operação não permitida';
      case 'auth/weak-password':
        return 'Senha muito fraca (mínimo de 6 caracteres)';
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
      case 'auth/invalid-credential':
        return 'Credenciais inválidas. Por favor, tente novamente.';
      case 'auth/redirect-cancelled-by-user':
        return 'Login cancelado pelo usuário.';
      case 'auth/redirect-operation-pending':
        return 'Uma operação de login já está em andamento.';
      case 'auth/web-storage-unsupported':
        return 'Seu navegador não suporta armazenamento web, necessário para o login.';
      case 'auth/network-request-failed':
        return 'Falha na conexão de rede. Verifique sua conexão com a internet.';
      case 'auth/internal-error':
        return 'Erro interno do Firebase. Tente novamente em alguns instantes.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/unauthorized-domain':
        return `Este domínio (${currentDomain}) não está autorizado para login. No Firebase Console, acesse Authentication > Settings > Authorized domains e adicione "${currentDomain}".`;
      case 'auth/redirect-uri-mismatch':
        return `Erro de configuração no Google Cloud. No console, acesse APIs & Services > Credentials > OAuth 2.0 Client IDs e adicione "${window.location.origin}/__/auth/handler" como URI autorizado de redirecionamento.`;
      case 'auth/timeout':
        return 'Tempo esgotado na operação. Verifique sua conexão e tente novamente.';
      case 'auth/popup-blocked':
        return 'O popup de login foi bloqueado pelo navegador. Permita popups para este site e tente novamente.';
      case 'auth/popup-window-closed':
        return 'A janela de login foi fechada. Mantenha a janela aberta até concluir o login.';
      default:
        return `Erro no login (${code}). Por favor, tente novamente ou use outro método.`;
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Coletar informações de diagnóstico detalhadas
      const currentDomain = window.location.host;
      const currentOrigin = window.location.origin;
      const currentProtocol = window.location.protocol;
      
      console.log("===== INÍCIO DO LOGIN COM GOOGLE =====");
      console.log("Domínio atual:", currentDomain);
      console.log("URL completa:", currentOrigin);
      console.log("Protocolo:", currentProtocol);
      console.log("User Agent:", navigator.userAgent);
      console.log("Verificando suporte a popup:", "Suportado");
      
      // Importar dinamicamente para obter a configuração do Firebase
      const firebaseModule = await import('@/lib/firebase');
      const isDev = firebaseModule.isDevelopment || false;
      const authDomain = isDev ? "gorf-jogo-de-bebidas.firebaseapp.com" : "gorf.com.br";
      
      console.log("Ambiente:", isDev ? "Desenvolvimento" : "Produção");
      console.log("authDomain configurado:", authDomain);
      console.log("Verifique se o domínio atual está autorizado no Firebase Console > Authentication > Settings > Authorized domains");
      
      // Mostrar informação útil para o usuário
      toast({
        title: "Tentando fazer login...",
        description: `Autenticando a partir de ${currentDomain}`,
        duration: 3000
      });
      
      try {
        // Configurar o Google Provider com parâmetros avançados para melhorar a compatibilidade
        googleProvider.setCustomParameters({
          // Sempre mostrar a seleção de conta
          prompt: 'select_account',
          // Forçar redirecionar para a página atual após autenticação
          redirect_uri: window.location.origin,
          // Requerendo todos os escopos necessários
          scope: 'email profile',
        });
        
        // Usar um timeout para garantir que o toast seja exibido
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tentar login com popup
        console.log("Abrindo popup de autenticação do Google...");
        const result = await signInWithPopup(auth, googleProvider);
        
        console.log("Login com Google bem sucedido:", result.user.email);
        toast({
          title: "Login bem sucedido!",
          description: "Redirecionando...",
          duration: 2000
        });
  
        // Verificar se o usuário já tem perfil
        const profile = await getUserProfile(result.user.uid);
        if (!profile) {
          console.log("Usuário não tem perfil, redirecionando para onboarding");
          setLocation("/onboarding");
        } else {
          console.log("Usuário tem perfil, redirecionando para dashboard");
          setLocation("/dashboard");
        }
      } catch (firebaseError: any) {
        console.error("===== ERRO NO LOGIN COM FIREBASE =====");
        console.error("Erro no login com Firebase:", firebaseError);
        console.error("Código do erro:", firebaseError.code);
        console.error("Mensagem do erro:", firebaseError.message);
        
        // Tratamento personalizado para cada tipo de erro comum
        if (firebaseError.code === 'auth/unauthorized-domain') {
          console.error("===== ERRO DE DOMÍNIO NÃO AUTORIZADO =====");
          console.error("Este domínio precisa ser adicionado à lista de domínios autorizados no console do Firebase");
          console.error("Domínio a ser adicionado:", currentDomain);
          
          toast({
            variant: "destructive",
            title: "Domínio não autorizado",
            description: `Para resolver este erro: Adicione "${currentDomain}" em Firebase Console > Authentication > Settings > Authorized domains`,
            duration: 10000
          });
        } else if (firebaseError.code === 'auth/redirect-uri-mismatch') {
          console.error("===== ERRO DE URI DE REDIRECIONAMENTO =====");
          console.error("URI de redirecionamento incorreto configurado no Google Cloud Console");
          console.error("URI a ser adicionado:", `${currentOrigin}/__/auth/handler`);
          
          toast({
            variant: "destructive",
            title: "Erro de configuração OAuth",
            description: `Configure no Google Cloud Console: APIs & Services > Credentials > OAuth 2.0 Client IDs e adicione "${currentOrigin}/__/auth/handler" como URI autorizado de redirecionamento`,
            duration: 10000
          });
        } else if (firebaseError.code === 'auth/popup-blocked') {
          toast({
            variant: "destructive",
            title: "Popup bloqueado",
            description: "O navegador bloqueou o popup de login. Por favor, permita popups para este site e tente novamente.",
            duration: 6000
          });
        } else if (firebaseError.code === 'auth/cancelled-popup-request' || 
                  firebaseError.code === 'auth/popup-closed-by-user') {
          // Erros menos graves, apenas mostrar mensagem mais simples
          toast({
            variant: "default",
            title: "Login cancelado",
            description: "Você fechou a janela de login antes de concluir.",
            duration: 3000
          });
        } else if (firebaseError.code === 'auth/network-request-failed') {
          toast({
            variant: "destructive",
            title: "Erro de conexão",
            description: "Verifique sua conexão com a internet e tente novamente.",
            duration: 5000
          });
        } else {
          // Para outros tipos de erro, relançar para o catch externo
          throw firebaseError;
        }
        
        // Não relançar o erro para certos códigos de erro que já foram tratados
        if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(firebaseError.code)) {
          setIsLoading(false);
          return; // Não tratar como erro grave
        }
        
        // Relançar o erro para ser tratado no catch externo
        throw firebaseError;
      }
    } catch (error: any) {
      console.error("Erro no login com Google:", error);
      const errorCode = error.code || "auth/unknown";
      const errorMessage = getErrorMessage(errorCode);
      setError(errorMessage);
      
      // Não mostrar o toast para erro de popup fechado pelo usuário
      if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(errorCode)) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: errorMessage,
          duration: 4000
        });
      }
    } finally {
      setIsLoading(false);
      console.log("===== FIM DA TENTATIVA DE LOGIN =====");
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
      console.log("Iniciando autenticação por email...");

      try {
        let userCredential;
        if (isLogin) {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } else {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        }
  
        console.log("Autenticação por email bem sucedida");
  
        // Verificar se o usuário já tem perfil
        const profile = await getUserProfile(userCredential.user.uid);
        if (!profile) {
          setLocation("/onboarding");
        } else {
          setLocation("/dashboard");
        }
      } catch (firebaseError: any) {
        console.error("Erro na autenticação por email com Firebase:", firebaseError);
        console.error("Código do erro:", firebaseError.code);
        
        // Relançar o erro para ser tratado no catch externo
        throw firebaseError;
      }
    } catch (error: any) {
      console.error("Erro na autenticação por email:", error);
      setError(getErrorMessage(error.code || "auth/unknown"));
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: getErrorMessage(error.code || "auth/unknown")
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8">
          <GorfLogo />
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-white">
              {isLogin ? "Bem-vindo" : "Crie sua conta"}
            </h1>
            <p className="text-xl text-white/80">Bora beber?</p>
          </div>

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