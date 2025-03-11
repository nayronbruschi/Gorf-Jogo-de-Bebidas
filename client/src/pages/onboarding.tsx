import { useState } from "react";
import { useLocation } from "wouter";
import { auth, createUserProfile } from "@/lib/firebase";
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
import { genderOptions, socialNetworkOptions } from "@shared/schema";

const steps = ["name", "birthDate", "gender", "social", "finish"] as const;
type Step = typeof steps[number];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("name");
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || "",
    birthDate: "",
    gender: "",
    favoriteSocialNetwork: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    const currentIndex = steps.indexOf(currentStep);

    // Validar campo atual
    if (!formData[currentStep as keyof typeof formData]) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o campo antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Se for o último passo, salvar dados
    if (currentStep === "finish") {
      try {
        if (!auth.currentUser) {
          throw new Error("Usuário não autenticado");
        }

        await createUserProfile(auth.currentUser.uid, formData);
        navigate("/dashboard");
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

    // Avançar para o próximo passo
    setCurrentStep(steps[currentIndex + 1]);
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
                className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white"
              />
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90">
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
                onChange={(e) => updateField("birthDate", e.target.value)}
                className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 focus-visible:ring-0 focus-visible:border-white"
              />
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90">
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
                <SelectTrigger className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 focus:ring-0">
                  <SelectValue placeholder="Selecione seu gênero" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90">
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
              <Select
                value={formData.favoriteSocialNetwork}
                onValueChange={(value) => updateField("favoriteSocialNetwork", value)}
              >
                <SelectTrigger className="bg-transparent border-0 border-b border-white/20 rounded-none text-white text-xl px-0 focus:ring-0">
                  <SelectValue placeholder="Selecione sua rede social favorita" />
                </SelectTrigger>
                <SelectContent>
                  {socialNetworkOptions.map((social) => (
                    <SelectItem key={social} value={social}>
                      {social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90">
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
            <Button onClick={handleNext} className="w-full bg-white text-purple-700 hover:bg-white/90">
              Vamos lá!
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-800 flex flex-col items-center justify-between p-4">
      <div className="w-full max-w-md mt-20">
        {renderStep()}
      </div>

      {/* Step bubbles */}
      <div className="flex gap-2 mb-8">
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
    </div>
  );
}