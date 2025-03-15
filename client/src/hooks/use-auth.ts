import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile, checkUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          console.log("Auth state changed - User logged in:", user.uid);
          setUser(user);

          // Verificar se o usuário tem perfil
          const hasProfile = await checkUserProfile(user.uid);
          console.log("User profile check:", hasProfile ? "exists" : "needs creation");

          if (!hasProfile) {
            console.log("New user detected, will redirect to onboarding");
            setIsNewUser(true);
            setProfile(null);
          } else {
            // Carregar perfil existente
            const userProfile = await getUserProfile(user.uid);
            console.log("Existing user profile loaded:", userProfile ? "success" : "failed");

            if (userProfile) {
              setProfile(userProfile);
              setIsNewUser(false);
            } else {
              // Se não conseguiu carregar o perfil, tratar como novo usuário
              console.log("Failed to load profile, treating as new user");
              setIsNewUser(true);
              setProfile(null);
            }
          }
        } else {
          console.log("Auth state changed - User logged out");
          setUser(null);
          setProfile(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar perfil",
          description: "Por favor, tente fazer login novamente."
        });
        setProfile(null);
        setIsNewUser(true); // Em caso de erro, tratar como novo usuário
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  return {
    user,
    profile,
    loading,
    isNewUser,
    isAuthenticated: !!user,
  };
}