import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trophy, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth, getUserProfile } from "@/lib/firebase";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@shared/schema";

export default function Profile() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const user = auth.currentUser;

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.uid) return;

      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil",
          variant: "destructive",
        });
      }
    };

    loadUserProfile();
  }, [user?.uid, toast]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const formatPlayTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 min-h-screen overflow-y-auto pb-32">
        <div className="space-y-8">
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
                <div className="flex items-start gap-4">
                  {userProfile?.profileImage ? (
                    <img
                      src={userProfile.profileImage}
                      alt="Foto de perfil"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-purple-900 flex items-center justify-center">
                      <span className="text-2xl text-white">
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">
                      {userProfile?.name || user.displayName || user.email?.split('@')[0] || "Usuário"}
                    </h3>
                    <p className="text-white/60">{user.email}</p>
                    {userProfile?.birthDate && (
                      <p className="text-white/60">
                        Data de Nascimento: {new Date(userProfile.birthDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {userProfile?.gender && (
                      <p className="text-white/60">
                        Gênero: {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)}
                      </p>
                    )}
                  </div>
                </div>

                {userProfile?.favoriteSocialNetwork && (
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Rede Social Favorita</p>
                    <p className="text-white">
                      {userProfile.favoriteSocialNetwork.charAt(0).toUpperCase() + 
                       userProfile.favoriteSocialNetwork.slice(1)}
                    </p>
                  </div>
                )}

                {userProfile?.favoriteDrinks && userProfile.favoriteDrinks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-white/60">Bebidas Favoritas</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.favoriteDrinks.map((drink) => (
                        <span key={drink} className="bg-purple-900/50 text-white px-3 py-1 rounded-full text-sm">
                          {drink}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {userProfile?.gameStats && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-white/60">Total de Jogos</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {userProfile.gameStats.totalGamesPlayed}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span className="text-white/60">Último Jogo</span>
                      </div>
                      <p className="text-lg font-medium text-white">
                        {userProfile.gameStats.lastGamePlayed || "Nenhum"}
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="text-white/60">Tempo Total</span>
                      </div>
                      <p className="text-lg font-medium text-white">
                        {formatPlayTime(userProfile.gameStats.totalPlayTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={userProfile}
          onProfileUpdated={() => {
            // Recarregar o perfil após a atualização
            if (user?.uid) {
              getUserProfile(user.uid).then(setUserProfile);
            }
          }}
        />
      </div>
    </AppLayout>
  );
}