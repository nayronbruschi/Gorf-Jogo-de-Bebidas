import { useEffect, useState } from "react";
import { auth, checkUserProfile, getUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("[Auth] Iniciando listener de autenticação");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          console.log("[Auth] Usuário autenticado:", user.uid);
          setUser(user);
          setLoading(true);

          // Verificar se o usuário tem perfil no Firestore
          const hasProfile = await checkUserProfile(user.uid);
          console.log("[Auth] Tem perfil:", hasProfile);

          if (!hasProfile) {
            // Novo usuário - precisa de onboarding
            console.log("[Auth] Novo usuário, redirecionando para onboarding");
            setIsNewUser(true);
            setProfile(null);
            localStorage.setItem('needsOnboarding', 'true');
          } else {
            // Usuário existente - carregar perfil
            console.log("[Auth] Carregando perfil existente");
            const userProfile = await getUserProfile(user.uid);

            if (userProfile) {
              console.log("[Auth] Perfil carregado com sucesso");
              setProfile(userProfile);
              setIsNewUser(false);
              localStorage.removeItem('needsOnboarding');
            } else {
              // Perfil não encontrado - tratar como novo usuário
              console.log("[Auth] Perfil não encontrado, tratando como novo usuário");
              setIsNewUser(true);
              setProfile(null);
              localStorage.setItem('needsOnboarding', 'true');
            }
          }
        } else {
          console.log("[Auth] Usuário deslogado");
          setUser(null);
          setProfile(null);
          setIsNewUser(false);
          localStorage.removeItem('needsOnboarding');
        }
      } catch (error) {
        console.error("[Auth] Erro:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Por favor, tente fazer login novamente."
        });
        setProfile(null);
        setIsNewUser(true);
        localStorage.setItem('needsOnboarding', 'true');
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
    profile,
    loading,
    isNewUser,
    isAuthenticated: !!user
  };
}