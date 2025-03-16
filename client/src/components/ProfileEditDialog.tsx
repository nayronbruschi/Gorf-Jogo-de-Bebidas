import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { genderOptions, socialNetworkOptions } from "@shared/schema";
import { ImageUploader } from "@/components/ImageUploader";
import type { UserProfile } from "@shared/schema";
import { Image } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { auth } from "@/lib/firebase";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile | null;
  onProfileUpdated: () => void;
}

const GENDER_LABELS = {
  "homem": "Masculino",
  "mulher": "Feminino",
  "não-binário": "Não-binário"
};

export function ProfileEditDialog({ open, onOpenChange, profile, onProfileUpdated }: ProfileEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const [formData, setFormData] = useState({
    name: profile?.name || user?.displayName || "",
    birthDate: profile?.birthDate || "",
    gender: profile?.gender || "",
    favoriteSocialNetwork: profile?.favoriteSocialNetwork || "",
    profileImage: profile?.profileImage || user?.photoURL || ""
  });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.uid) throw new Error("Usuário não autenticado");
      await apiRequest("PATCH", `/api/profile/${user.uid}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      onProfileUpdated();
      onOpenChange(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (url: string) => {
    updateField("profileImage", url);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync(formData);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pb-16">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Foto de Perfil</label>
            <div className="space-y-4">
              {formData.profileImage && (
                <img
                  src={formData.profileImage}
                  alt="Foto de perfil"
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
              )}
              <ImageUploader onUploadComplete={handleImageUpload} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Seu nome"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Data de Nascimento</label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className="bg-gray-800 border-gray-700 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Gênero</label>
            <Select
              value={formData.gender}
              onValueChange={(value) => updateField("gender", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {genderOptions.map((gender) => (
                  <SelectItem key={gender} value={gender} className="text-white hover:bg-gray-700">
                    {GENDER_LABELS[gender]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Rede Social Favorita</label>
            <Select
              value={formData.favoriteSocialNetwork}
              onValueChange={(value) => updateField("favoriteSocialNetwork", value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione sua rede social favorita" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {socialNetworkOptions.map((social) => (
                  <SelectItem key={social} value={social} className="text-white hover:bg-gray-700">
                    {social.charAt(0).toUpperCase() + social.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sticky bottom-0 pt-4 bg-gray-900">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {updateProfile.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}