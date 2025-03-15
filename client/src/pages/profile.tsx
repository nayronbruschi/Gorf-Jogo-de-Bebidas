import { useEffect, useState } from "react";
import { auth, getUserProfile } from "@/lib/firebase";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@shared/schema";
import { Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function loadUserData() {
      if (!auth.currentUser) return;

      try {
        const userProfile = await getUserProfile(auth.currentUser.uid);
        setProfile(userProfile);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleProfileUpdated = async () => {
    if (!auth.currentUser) return;
    const updatedProfile = await getUserProfile(auth.currentUser.uid);
    setProfile(updatedProfile);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Information */}
          <Card className="bg-white/10 backdrop-blur-lg border-none relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-5 w-5" />
            </Button>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Nome</p>
                  <p className="text-white">{profile?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Data de Nascimento</p>
                  <p className="text-white">
                    {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Gênero</p>
                  <p className="text-white">{profile?.gender || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Rede Social Favorita</p>
                  <p className="text-white">{profile?.favoriteSocialNetwork || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Bebidas Favoritas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.favoriteDrinks?.map(drink => (
                      <span key={drink} className="bg-purple-500/20 text-white px-2 py-1 rounded text-sm">
                        {drink}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </AppLayout>
  );
}