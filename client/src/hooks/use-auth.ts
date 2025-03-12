import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);

      if (user) {
        try {
          // Tentar obter perfil existente
          let userProfile = await getUserProfile(user.uid);

          // Se não existir, criar um novo
          if (!userProfile) {
            userProfile = await createUserProfile(user.uid);
          }

          setProfile(userProfile);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
  };
}