import { useEffect, useState } from "react";
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[Auth] Iniciando listener de autenticação");
    const unsubscribe = auth.onAuthStateChanged((user) => {
      try {
        if (user) {
          console.log("[Auth] Usuário autenticado:", user.uid);
          setUser(user);
          setIsNewUser(false);
        } else {
          console.log("[Auth] Usuário deslogado");
          setUser(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("[Auth] Erro:", error);
        toast({
          variant: "destructive",
          title: "Erro na autenticação",
          description: "Por favor, tente fazer login novamente."
        });
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log("[Auth] Limpando listener");
      unsubscribe();
    };
  }, [toast]);

  return {
    user,
    loading,
    isNewUser,
    isAuthenticated: !!user
  };
}