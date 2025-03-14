import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          setUser(user);
          const userProfile = await getUserProfile(user.uid);

          // Se não existe perfil, criar um novo
          if (!userProfile) {
            setIsNewUser(true);
          } else {
            setProfile(userProfile);
            setIsNewUser(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setIsNewUser(false);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    isNewUser,
    isAuthenticated: !!user,
  };
}