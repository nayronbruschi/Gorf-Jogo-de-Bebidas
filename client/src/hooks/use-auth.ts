import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile } from "@/lib/firebase";
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

          // Tentar obter o perfil do usuário
          const userProfile = await getUserProfile(user.uid);
          console.log("User profile fetched:", userProfile ? "exists" : "not found");

          if (!userProfile) {
            console.log("New user detected, redirecting to onboarding");
            setIsNewUser(true);
            setProfile(null);
          } else {
            console.log("Existing user profile loaded");
            setProfile(userProfile);
            setIsNewUser(false);
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
        setIsNewUser(false);
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