import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Image } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { uploadImage } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const user = auth.currentUser;

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
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Nome</p>
                  <p className="text-white">{user.displayName || user.email?.split('@')[0] || "Usuário"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
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
                <div className="text-center mt-4">
                  <p className="text-white/60">
                    Funcionalidades adicionais do perfil serão implementadas em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={null}
          onProfileUpdated={() => {}}
        />
      </div>
    </AppLayout>
  );
}