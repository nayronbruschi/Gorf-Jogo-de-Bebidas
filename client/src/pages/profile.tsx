import { useEffect, useState } from "react";
import { auth, getUserProfile, getUserStats, updateUserProfile } from "@/lib/firebase";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile, UserGameStats } from "@shared/schema";
import { Loader2, Clock, Trophy, Users, GamepadIcon, History, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserGameStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    async function loadUserData() {
      if (!auth.currentUser) return;

      try {
        const [userProfile, userStats] = await Promise.all([
          getUserProfile(auth.currentUser.uid),
          getUserStats(auth.currentUser.uid)
        ]);

        setProfile(userProfile);
        setStats(userStats);
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
              </div>
            </CardContent>
          </Card>

          {/* Game Statistics */}
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Estatísticas de Jogo</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.totalGamesPlayed === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/60 mb-4">Você ainda não jogou nenhuma partida</p>
                  <Button
                    onClick={() => navigate("/game-modes")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Jogar Agora
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={History}
                    label="Último Jogo"
                    value={stats?.lastGamePlayed ? new Date(stats.lastGamePlayed).toLocaleDateString('pt-BR') : 'Nenhum'}
                  />
                  <StatCard
                    icon={GamepadIcon}
                    label="Jogos Jogados"
                    value={stats?.totalGamesPlayed || 0}
                  />
                  <StatCard
                    icon={Trophy}
                    label="Vitórias"
                    value={stats?.victories || 0}
                  />
                  <StatCard
                    icon={Users}
                    label="Jogadores"
                    value={stats?.uniquePlayers || 0}
                  />
                  <StatCard
                    icon={Clock}
                    label="Tempo Total"
                    value={`${stats?.totalPlayTime || 0} min`}
                  />
                </div>
              )}
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

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-lg bg-white/5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="h-5 w-5 text-white/60" />
        <p className="text-sm text-white/60">{label}</p>
      </div>
      <p className="text-xl font-semibold text-white">{value}</p>
    </div>
  );
}