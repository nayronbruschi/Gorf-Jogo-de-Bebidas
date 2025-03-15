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
    console.log("Setting up auth state listener");
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          console.log(`User authenticated: ${user.uid}`);
          setUser(user);
          setLoading(true);

          // 1. Verificar se o perfil existe
          const hasProfile = await checkUserProfile(user.uid);
          console.log(`Profile check result: ${hasProfile}`);

          if (!hasProfile) {
            console.log("No profile found, marking as new user");
            setIsNewUser(true);
            setProfile(null);
          } else {
            console.log("Profile exists, fetching data");
            const userProfile = await getUserProfile(user.uid);

            if (userProfile) {
              console.log("Profile loaded successfully");
              setProfile(userProfile);
              setIsNewUser(false);
            } else {
              console.log("Failed to load profile, will recreate");
              setIsNewUser(true);
              setProfile(null);

              // Tentar criar o perfil automaticamente
              try {
                const newProfile = await createUserProfile(user.uid);
                console.log("Profile created automatically");
                setProfile(newProfile);
                setIsNewUser(false);
              } catch (error) {
                console.error("Failed to create profile automatically:", error);
                setIsNewUser(true);
              }
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
    isAuthenticated: !!user,
  };
}