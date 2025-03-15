import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
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
      // TODO: Implement profile update functionality
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A edição de perfil será implementada em breve.",
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
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Editar Perfil
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
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

          <Button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}