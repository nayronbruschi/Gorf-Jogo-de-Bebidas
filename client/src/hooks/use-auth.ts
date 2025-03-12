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
      setLoading(true);

      if (user) {
        try {
          let userProfile = await getUserProfile(user.uid);

          if (!userProfile) {
            // Criar um novo perfil com dados do Google se disponível
            const defaultName = user.displayName || user.email?.split('@')[0] || '';
            userProfile = await createUserProfile(user.uid, {
              name: defaultName,
            });
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