import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Check, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { InstallPromptConfig } from "../../../shared/schema";

export default function InstallPromptSettings() {
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(true);
  const [frequency, setFrequency] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Buscar configurações atuais
  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/install-prompt-config'],
    queryFn: async () => {
      const response = await fetch('/api/install-prompt-config');
      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }
      return response.json();
    },
  });

  // Atualizar estado local quando os dados forem carregados
  useEffect(() => {
    if (config) {
      setIsEnabled(config.enabled);
      setFrequency(config.frequency);
      
      if (config.startDate) {
        setStartDate(new Date(config.startDate));
      }
      
      if (config.endDate) {
        setEndDate(new Date(config.endDate));
      }
    }
  }, [config]);

  // Mutation para salvar configurações
  const saveMutation = useMutation({
    mutationFn: async (data: InstallPromptConfig) => {
      return apiRequest({
        url: '/api/install-prompt-config',
        method: 'POST',
        data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do popup de instalação foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
      console.error("Erro ao salvar configurações:", error);
    },
  });

  const handleSave = () => {
    const data: InstallPromptConfig = {
      enabled: isEnabled,
      frequency,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
    };
    
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-purple-700 border-b-purple-700 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-purple-800">Configurações do Popup de Instalação</h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Configurar Popup de Instalação
            </CardTitle>
            <CardDescription>
              Configure quando e com que frequência os usuários verão o popup para adicionar o app à tela inicial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Ativar popup de instalação</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, os usuários verão um popup sugerindo adicionar o app à tela inicial.
                </p>
              </div>
              <Switch 
                checked={isEnabled} 
                onCheckedChange={setIsEnabled} 
                className="data-[state=checked]:bg-purple-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência (em dias)</Label>
              <p className="text-sm text-muted-foreground">
                Define de quantos em quantos dias o popup deve ser exibido para o mesmo usuário.
              </p>
              <Input 
                id="frequency" 
                type="number" 
                min={1} 
                max={30} 
                value={frequency} 
                onChange={(e) => setFrequency(parseInt(e.target.value) || 1)} 
                className="max-w-xs"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Data de início</Label>
                <p className="text-sm text-muted-foreground">
                  O popup começará a ser exibido a partir desta data (opcional).
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {startDate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setStartDate(null)}
                    className="mt-1 h-7 px-3 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Data de término</Label>
                <p className="text-sm text-muted-foreground">
                  O popup deixará de ser exibido após esta data (opcional).
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => setEndDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {endDate && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEndDate(null)}
                    className="mt-1 h-7 px-3 text-xs"
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                className="bg-purple-700 hover:bg-purple-800"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
            <CardDescription>
              Veja como ficará o popup de instalação nos dispositivos móveis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">Visual no iOS:</h3>
                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-gray-300 bg-white flex items-center justify-center">
                  <img 
                    src="/api/images/add-to-homescreen-ios.svg" 
                    alt="Instruções iOS" 
                    className="max-h-full object-contain" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "../assets/add-to-homescreen-ios.svg";
                    }}
                  />
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-sm mb-2">Visual no Android:</h3>
                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-gray-300 bg-white flex items-center justify-center">
                  <img 
                    src="/api/images/add-to-homescreen-android.svg" 
                    alt="Instruções Android" 
                    className="max-h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "../assets/add-to-homescreen-android.svg";
                    }} 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}