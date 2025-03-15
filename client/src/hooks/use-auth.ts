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
    console.log("Setting up auth state listener");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          console.log("User authenticated:", user.uid);
          setUser(user);
          setLoading(true);

          // Verificar se o usuário tem perfil no Firestore
          const hasProfile = await checkUserProfile(user.uid);
          console.log("Has profile:", hasProfile);

          if (!hasProfile) {
            console.log("New user, needs onboarding");
            setIsNewUser(true);
            setProfile(null);
          } else {
            console.log("Existing user, loading profile");
            const userProfile = await getUserProfile(user.uid);

            if (userProfile) {
              console.log("Profile loaded successfully");
              setProfile(userProfile);
              setIsNewUser(false);
            } else {
              console.log("Failed to load profile, marking as new user");
              setIsNewUser(true);
              setProfile(null);
            }
          }
        } else {
          console.log("User logged out");
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
        setIsNewUser(true);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth state listener");
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