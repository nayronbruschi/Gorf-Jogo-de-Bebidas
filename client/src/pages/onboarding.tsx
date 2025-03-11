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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Qual é o seu nome?</CardTitle>
              <CardDescription>
                Como você gostaria de ser chamado no jogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </>
        );

      case "birthDate":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Quando você nasceu?</CardTitle>
              <CardDescription>
                Precisamos saber sua data de nascimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateField("birthDate", e.target.value)}
                  />
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </>
        );

      case "gender":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Qual é seu gênero?</CardTitle>
              <CardDescription>
                Como você se identifica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateField("gender", value)}
                  >
                    <SelectTrigger>
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
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </>
        );

      case "social":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Rede social favorita</CardTitle>
              <CardDescription>
                Qual rede social você mais usa?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social">Rede Social</Label>
                  <Select
                    value={formData.favoriteSocialNetwork}
                    onValueChange={(value) => updateField("favoriteSocialNetwork", value)}
                  >
                    <SelectTrigger>
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
                </div>
                <Button onClick={handleNext} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </>
        );

      case "finish":
        return (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Tudo pronto!</CardTitle>
              <CardDescription>
                Agora você pode começar a jogar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleNext} className="w-full">
                Vamos lá!
              </Button>
            </CardContent>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        {renderStep()}
      </Card>
    </div>
  );
}
