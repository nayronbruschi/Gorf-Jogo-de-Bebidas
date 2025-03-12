import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { auth, createUserProfile, updateUserProfile } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { genderOptions, socialNetworkOptions } from "@shared/schema";
import { SiInstagram, SiTiktok, SiFacebook } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { ChevronLeft } from "lucide-react";

const steps = ["name", "birthDate", "gender", "social", "finish"] as const;
type Step = typeof steps[number];

const SOCIAL_ICONS = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  X: FaXTwitter,
  facebook: SiFacebook,
};

const GENDER_LABELS = {
  "homem": "Masculino",
  "mulher": "Feminino",
  "não-binário": "Não-binário"
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    favoriteSocialNetwork: "",
  });

  // Load user data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!auth.currentUser) {
        setLocation("/auth");
        return;
      }

      // Try to get existing profile
      const profile = await createUserProfile(auth.currentUser.uid);
      if (profile) {
        setFormData({
          name: profile.name || auth.currentUser.displayName || "",
          birthDate: profile.birthDate || "",
          gender: profile.gender || "",
          favoriteSocialNetwork: profile.favoriteSocialNetwork || "",
        });
      }
    };

    loadInitialData();
  }, [setLocation]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField("birthDate", e.target.value);
  };

  const handleNext = async () => {
    const currentIndex = steps.indexOf(currentStep);

    // Se for o último passo, salvar dados
    if (currentStep === "finish") {
      try {
        if (!auth.currentUser) {
          throw new Error("Usuário não autenticado");
        }

        // Atualizar perfil
        await updateUserProfile({
          ...formData,
          id: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Redirecionar para o dashboard
        setLocation("/dashboard");
      } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar seu perfil. Tente novamente.",
          variant: "destructive",
        });
      }
      return;
    }

    // Validar campo atual apenas se não estiver no passo final
    if (!formData[currentStep as keyof typeof formData]) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o campo antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Avançar para o próximo passo
    setCurrentStep(steps[currentIndex + 1]);
  };

  const toggleSocialNetwork = (network: string) => {
    updateField("favoriteSocialNetwork", network);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "name":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Qual é o seu nome?</h2>
              <p className="text-white/60">
                Como você gostaria de ser chamado no jogo
              </p>
            </div>
            <div className="space-y-6">
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Seu nome"
                className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 text-center placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white hover:border-white/40"
              />
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90 py-7">
                Continuar
              </Button>
            </div>
          </div>
        );

      case "birthDate":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Quando você nasceu?</h2>
              <p className="text-white/60">
                Precisamos saber sua data de nascimento
              </p>
            </div>
            <div className="space-y-6">
              <Input
                type="date"
                value={formData.birthDate}
                onChange={handleBirthDateChange}
                className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 text-center placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white hover:border-white/40 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
              />
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90 py-7">
                Continuar
              </Button>
            </div>
          </div>
        );

      case "gender":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Qual é seu gênero?</h2>
              <p className="text-white/60">
                Como você se identifica
              </p>
            </div>
            <div className="space-y-6">
              <Select
                value={formData.gender}
                onValueChange={(value) => updateField("gender", value)}
              >
                <SelectTrigger className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 text-center focus:ring-0 focus-visible:ring-0 focus-visible:border-white hover:border-white/40">
                  <SelectValue placeholder="Selecione seu gênero" className="text-center" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {GENDER_LABELS[gender]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90 py-7">
                Continuar
              </Button>
            </div>
          </div>
        );

      case "social":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Rede social favorita</h2>
              <p className="text-white/60">
                Qual rede social você mais usa?
              </p>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {socialNetworkOptions.map((social) => {
                  const Icon = SOCIAL_ICONS[social];
                  const isSelected = formData.favoriteSocialNetwork === social;
                  return (
                    <button
                      key={social}
                      onClick={() => toggleSocialNetwork(social)}
                      className={`p-6 rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'border-white bg-white/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <Icon className="w-8 h-8 text-white mx-auto" />
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={handleNext}
                className="w-full bg-white text-purple-700 hover:bg-white/90 py-7"
                disabled={!formData.favoriteSocialNetwork}
              >
                Continuar
              </Button>
            </div>
          </div>
        );

      case "finish":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Tudo pronto!</h2>
              <p className="text-white/60">
                Agora você pode começar a jogar
              </p>
            </div>
            <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90 py-7">
              Vamos lá!
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex flex-col items-center justify-between p-4">
      <div className="flex-1" />
      <div className="w-full max-w-md">
        {renderStep()}
      </div>

      {/* Step bubbles and back button */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex gap-2">
          {steps.map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                steps.indexOf(step) === steps.indexOf(currentStep)
                  ? "bg-white"
                  : steps.indexOf(step) < steps.indexOf(currentStep)
                  ? "bg-white/60"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
        {currentStep !== "name" && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-white hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
      </div>
      <div className="flex-1" />
    </div>
  );
}