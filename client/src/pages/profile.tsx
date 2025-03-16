import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Image, Trophy, Activity, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface GameStats {
  totalGames: number;
  favoriteModes: { [key: string]: number };
  totalTimePlayed: number;
  lastPlayed: string;
}

export default function Profile() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const user = auth.currentUser;

  const { data: userProfile } = useQuery({
    queryKey: ["/api/profile", user?.uid],
    enabled: !!user?.uid
  });

  const { data: gameStats } = useQuery<GameStats>({
    queryKey: ["/api/stats", user?.uid],
    enabled: !!user?.uid
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleGalleryAccess = async () => {
    try {
      setIsUploadingGallery(true);
      // Solicitar acesso à galeria
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files) return;

        try {
          // Upload all files in parallel
          const uploadPromises = Array.from(files).map(async (file) => {
            const fileName = `gallery/${Date.now()}-${file.name}`;
            return await uploadImage(file, fileName);
          });

          await Promise.all(uploadPromises);

          toast({
            title: "Upload completo",
            description: "Todas as imagens foram enviadas com sucesso!",
          });
        } catch (error) {
          console.error('Erro no upload:', error);
          toast({
            title: "Erro no upload",
            description: "Não foi possível fazer o upload de algumas imagens.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingGallery(false);
        }
      };

      input.click();
    } catch (error) {
      console.error('Erro ao acessar galeria:', error);
      setIsUploadingGallery(false);
    }
  };

  const getFavoriteMode = () => {
    if (!gameStats?.favoriteModes) return null;
    const modes = Object.entries(gameStats.favoriteModes);
    if (modes.length === 0) return null;
    return modes.sort((a, b) => b[1] - a[1])[0][0];
  };

  const formatPlayTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
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
                      {user.displayName || user.email?.split('@')[0] || "Usuário"}
                    </h3>
                    <p className="text-white/60">{user.email}</p>
                    {userProfile?.gender && (
                      <p className="text-white/60 mt-1">
                        {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1)}
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

                <div className="space-y-1">
                  <p className="text-sm text-white/60">Imagens da Galeria</p>
                  <Button
                    onClick={handleGalleryAccess}
                    disabled={isUploadingGallery}
                    className="w-full bg-purple-900 hover:bg-purple-950 text-white"
                  >
                    <Image className="h-5 w-5 mr-2" />
                    {isUploadingGallery ? "Enviando imagens..." : "Escolher da Galeria"}
                  </Button>
                </div>

                {gameStats && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="text-white/60">Total de Jogos</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{gameStats.totalGames}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-green-500" />
                        <span className="text-white/60">Modo Favorito</span>
                      </div>
                      <p className="text-lg font-medium text-white">{getFavoriteMode() || "Nenhum"}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="text-white/60">Tempo Total</span>
                      </div>
                      <p className="text-lg font-medium text-white">
                        {formatPlayTime(gameStats.totalTimePlayed)}
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
          onProfileUpdated={() => {}}
        />
      </div>
    </AppLayout>
  );
}