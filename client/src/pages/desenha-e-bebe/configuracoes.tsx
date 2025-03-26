import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Clock, Palette, Drama, CheckSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Tipo de jogador
type Jogador = {
  id: string;
  nome: string;
  pontos: number;
  acertos: number;
  vezes: number;
  bebidas: number;
};

// Modo de representação
type ModoRepresentacao = "desenho" | "mimica";

// Configurações do jogo
type ConfigJogo = {
  tempo: number;
  rodadas: number;
  categorias: string[];
  maxJogadores: number;
  modoRepresentacao: ModoRepresentacao;
  metaVitoria: number; // Quantidade de pontos necessários para vencer
};

// Categorias do jogo
const CATEGORIAS = [
  { id: "pessoa", nome: "Pessoa/Animal", cor: "bg-blue-600", dificuldade: 1 },
  { id: "lugar", nome: "Lugar", cor: "bg-green-600", dificuldade: 2 },
  { id: "objeto", nome: "Objeto", cor: "bg-yellow-600", dificuldade: 1 },
  { id: "acao", nome: "Ação", cor: "bg-red-600", dificuldade: 2 },
  { id: "expressao", nome: "Expressão", cor: "bg-purple-600", dificuldade: 3 },
  { id: "aleatorio", nome: "Aleatório", cor: "bg-gray-600", dificuldade: 2 },
  { id: "bebida", nome: "Bebida (Difícil)", cor: "bg-pink-600", dificuldade: 3 },
];

export default function DesenhaEBebeConfiguracoes() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [config, setConfig] = useState<ConfigJogo>({
    tempo: 60,
    rodadas: 3,
    categorias: CATEGORIAS.map(c => c.id),
    maxJogadores: 8,
    modoRepresentacao: "desenho",
    metaVitoria: 5
  });
  
  // Carregar jogadores do localStorage
  useEffect(() => {
    const jogadoresSalvos = localStorage.getItem('desenhaEBebeJogadores');
    if (jogadoresSalvos) {
      try {
        const parsed = JSON.parse(jogadoresSalvos);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setJogadores(parsed);
        } else {
          // Se não houver jogadores suficientes, voltar para a página de jogadores
          navigate("/desenha-e-bebe/jogadores");
          toast({
            title: "Jogadores insuficientes",
            description: "Adicione pelo menos 2 jogadores para continuar",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar jogadores:", error);
        navigate("/desenha-e-bebe/jogadores");
      }
    } else {
      // Se não houver jogadores salvos, voltar para a página de jogadores
      navigate("/desenha-e-bebe/jogadores");
    }
  }, [navigate, toast]);

  // Manipuladores de alteração de configuração
  const handleTempoChange = (value: number[]) => {
    setConfig({ ...config, tempo: value[0] });
  };

  const handleMetaVitoriaChange = (value: number[]) => {
    setConfig({ ...config, metaVitoria: value[0] });
  };

  const handleModoRepresentacaoChange = (value: ModoRepresentacao) => {
    setConfig({ ...config, modoRepresentacao: value });
  };

  const handleCategoriaChange = (categoriaId: string, checked: boolean) => {
    if (checked) {
      // Adicionar categoria
      setConfig({ ...config, categorias: [...config.categorias, categoriaId] });
    } else {
      // Remover categoria
      if (config.categorias.length <= 1) {
        toast({
          title: "Atenção",
          description: "É necessário selecionar pelo menos uma categoria",
          variant: "destructive",
        });
        return;
      }
      setConfig({ ...config, categorias: config.categorias.filter(id => id !== categoriaId) });
    }
  };

  const iniciarJogo = () => {
    // Verificar se há pelo menos uma categoria selecionada
    if (config.categorias.length === 0) {
      toast({
        title: "Categorias insuficientes",
        description: "Selecione pelo menos uma categoria para jogar",
        variant: "destructive",
      });
      return;
    }

    // Salvar configurações e jogadores no localStorage
    localStorage.setItem('desenhaEBebeConfig', JSON.stringify(config));
    localStorage.setItem('desenhaEBebeJogadores', JSON.stringify(jogadores));
    
    // Navegar para a página de jogo
    navigate("/desenha-e-bebe/jogo");
  };

  return (
    <GameLayout title="Desenha e Bebe" showPlayers={false}>
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Card className="w-full max-w-3xl">
          <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Configurações</CardTitle>
            <CardDescription className="text-center text-gray-200">
              Personalize o jogo do seu jeito
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base flex items-center">
                    <Clock className="mr-2 h-4 w-4" /> 
                    Tempo para cada rodada: <span className="ml-2 font-bold text-purple-700">{config.tempo} segundos</span>
                  </Label>
                </div>
                <Slider
                  defaultValue={[config.tempo]}
                  min={30}
                  max={120}
                  step={5}
                  value={[config.tempo]}
                  onValueChange={handleTempoChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30s</span>
                  <span>60s</span>
                  <span>90s</span>
                  <span>120s</span>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-base flex items-center">
                    <CheckSquare className="mr-2 h-4 w-4" /> 
                    Pontos para vencer: <span className="ml-2 font-bold text-purple-700">{config.metaVitoria} pontos</span>
                  </Label>
                </div>
                <Slider
                  defaultValue={[config.metaVitoria]}
                  min={3}
                  max={15}
                  step={1}
                  value={[config.metaVitoria]}
                  onValueChange={handleMetaVitoriaChange}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>3</span>
                  <span>7</span>
                  <span>11</span>
                  <span>15</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base flex items-center mb-4">
                  <Palette className="mr-2 h-4 w-4" /> Modo de jogo
                </Label>
                
                <RadioGroup 
                  defaultValue={config.modoRepresentacao}
                  value={config.modoRepresentacao}
                  onValueChange={(value) => handleModoRepresentacaoChange(value as ModoRepresentacao)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 bg-white rounded-lg border p-4 flex-1">
                    <RadioGroupItem value="desenho" id="desenho" />
                    <Label htmlFor="desenho" className="flex flex-col gap-1">
                      <span className="font-medium">Desenho</span>
                      <span className="text-xs text-gray-500">Desenhe na tela</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 bg-white rounded-lg border p-4 flex-1">
                    <RadioGroupItem value="mimica" id="mimica" />
                    <Label htmlFor="mimica" className="flex flex-col gap-1">
                      <span className="font-medium">Mímica</span>
                      <span className="text-xs text-gray-500">Faça gestos</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label className="text-base flex items-center mb-4">
                  <Drama className="mr-2 h-4 w-4" /> Categorias de palavras
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {CATEGORIAS.map((categoria) => (
                    <div key={categoria.id} className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-md">
                      <Checkbox 
                        id={`categoria-${categoria.id}`}
                        checked={config.categorias.includes(categoria.id)}
                        onCheckedChange={(checked) => 
                          handleCategoriaChange(categoria.id, checked as boolean)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${categoria.cor}`}></div>
                        <Label
                          htmlFor={`categoria-${categoria.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {categoria.nome}
                        </Label>
                        <span className="text-xs text-gray-500">
                          (Nível {categoria.dificuldade})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/desenha-e-bebe/jogadores")}
              className="w-full sm:w-auto border-purple-200 text-purple-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            
            <Button 
              onClick={iniciarJogo}
              className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Iniciar Jogo
            </Button>
          </CardFooter>
        </Card>
      </div>
    </GameLayout>
  );
}