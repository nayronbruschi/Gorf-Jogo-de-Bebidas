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
          let userProfile = await getUserProfile(user.uid);

          if (!userProfile) {
            // Criar perfil mínimo para forçar onboarding
            userProfile = await createUserProfile(user.uid, {
              name: user.displayName || "",
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