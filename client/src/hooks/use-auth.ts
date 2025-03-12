import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        setUser(user);

        if (user) {
          const userProfile = await getUserProfile(user.uid);
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user
  };
}