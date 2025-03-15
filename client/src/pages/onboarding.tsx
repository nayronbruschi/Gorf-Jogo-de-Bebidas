import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { createUserProfile } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { drinkOptions } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    birthDate: "",
    gender: "homem" as const,
    favoriteSocialNetwork: "instagram" as const,
  });

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleSelectDrink = (drink: string) => {
    if (selectedDrinks.includes(drink)) {
      setSelectedDrinks(prev => prev.filter(d => d !== drink));
    } else if (selectedDrinks.length < 3) {
      setSelectedDrinks(prev => [...prev, drink]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDrinks.length === 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione pelo menos uma bebida favorita"
      });
      return;
    }

    setIsLoading(true);

    try {
      await createUserProfile(user.uid, {
        ...formData,
        favoriteDrinks: selectedDrinks,
      });

      toast({
        title: "Perfil criado com sucesso!",
        description: "Bem-vindo ao Gorf!"
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar perfil",
        description: "Por favor, tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            Seja bem-vindo!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white" htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/20 text-white placeholder:text-white/60 border-none"
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white" htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="bg-white/20 text-white placeholder:text-white/60 border-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Gênero</Label>
              <Select
                value={formData.gender}
                onValueChange={(value: "homem" | "mulher" | "não-binário") =>
                  setFormData({ ...formData, gender: value })}
              >
                <SelectTrigger className="bg-white/20 text-white border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homem">Homem</SelectItem>
                  <SelectItem value="mulher">Mulher</SelectItem>
                  <SelectItem value="não-binário">Não-binário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Rede Social Favorita</Label>
              <Select
                value={formData.favoriteSocialNetwork}
                onValueChange={(value: "instagram" | "tiktok" | "facebook" | "twitter") =>
                  setFormData({ ...formData, favoriteSocialNetwork: value })}
              >
                <SelectTrigger className="bg-white/20 text-white border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Bebidas Favoritas (escolha até 3)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedDrinks.map(drink => (
                  <Badge
                    key={drink}
                    variant="secondary"
                    className="bg-purple-500 text-white"
                  >
                    {drink}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => handleSelectDrink(drink)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {drinkOptions.map(drink => (
                  <Button
                    key={drink}
                    type="button"
                    variant={selectedDrinks.includes(drink) ? "secondary" : "outline"}
                    className={`
                      ${selectedDrinks.includes(drink)
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/20 text-white hover:bg-white/30'}
                      transition-colors
                    `}
                    onClick={() => handleSelectDrink(drink)}
                    disabled={selectedDrinks.length >= 3 && !selectedDrinks.includes(drink)}
                  >
                    {drink}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Criando perfil..." : "Começar a jogar"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}