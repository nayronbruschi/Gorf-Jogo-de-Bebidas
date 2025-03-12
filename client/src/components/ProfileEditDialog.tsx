import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/firebase";
import { genderOptions, socialNetworkOptions } from "@shared/schema";
import type { UserProfile } from "@shared/schema";

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
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    birthDate: profile?.birthDate || "",
    gender: profile?.gender || "",
    favoriteSocialNetwork: profile?.favoriteSocialNetwork || ""
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateUserProfile({
        ...formData,
        id: profile?.id || "",
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      onProfileUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-purple-900">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Seu nome"
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Data de Nascimento</label>
            <Input
              type="date"
              value={formData.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Gênero</label>
            <Select
              value={formData.gender}
              onValueChange={(value) => updateField("gender", value)}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {GENDER_LABELS[gender]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600">Rede Social Favorita</label>
            <Select
              value={formData.favoriteSocialNetwork}
              onValueChange={(value) => updateField("favoriteSocialNetwork", value)}
            >
              <SelectTrigger className="bg-gray-50">
                <SelectValue placeholder="Selecione sua rede social favorita" />
              </SelectTrigger>
              <SelectContent>
                {socialNetworkOptions.map((social) => (
                  <SelectItem key={social} value={social}>
                    {social.charAt(0).toUpperCase() + social.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
