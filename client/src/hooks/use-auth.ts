import { useEffect, useState } from "react";
import { auth, createUserProfile, getUserProfile } from "@/lib/firebase";
import type { UserProfile } from "@shared/schema";

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          setUser(user);
          let userProfile = await getUserProfile(user.uid);

          if (!userProfile) {
            userProfile = await createUserProfile(user.uid, {
              name: user.displayName || "",
            });
          }

          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
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
    isAuthenticated: !!user,
  };
}