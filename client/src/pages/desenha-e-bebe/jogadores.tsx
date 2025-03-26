import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X as CrossIcon, Plus as PlusIcon, ArrowRight as ArrowRightIcon, ChevronUp as ChevronUpIcon, ChevronDown as ChevronDownIcon, Trash as TrashIcon } from "lucide-react";

// Tipo de jogador
type Jogador = {
  id: string;
  nome: string;
  pontos: number;
  acertos: number;
  vezes: number;
  bebidas: number;
};

export default function DesenhaEBebeJogadores() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [novoJogador, setNovoJogador] = useState("");
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  
  // Carregar jogadores do localStorage
  useEffect(() => {
    const jogadoresSalvos = localStorage.getItem('desenhaEBebeJogadores');
    if (jogadoresSalvos) {
      try {
        setJogadores(JSON.parse(jogadoresSalvos));
      } catch (error) {
        console.error("Erro ao carregar jogadores:", error);
      }
    }
  }, []);
  
  // Salvar jogadores no localStorage
  useEffect(() => {
    localStorage.setItem('desenhaEBebeJogadores', JSON.stringify(jogadores));
  }, [jogadores]);
  
  const adicionarJogador = () => {
    if (novoJogador.trim() === "") {
      toast({
        title: "Nome inválido",
        description: "Digite um nome para o jogador",
        variant: "destructive",
      });
      return;
    }
    
    if (jogadores.length >= 8) {
      toast({
        title: "Limite de jogadores",
        description: "O jogo suporta no máximo 8 jogadores",
        variant: "destructive",
      });
      return;
    }
    
    if (jogadores.some(j => j.nome.toLowerCase() === novoJogador.trim().toLowerCase())) {
      toast({
        title: "Nome duplicado",
        description: "Já existe um jogador com esse nome",
        variant: "destructive",
      });
      return;
    }
    
    const novoJogadorObj: Jogador = {
      id: Math.random().toString(36).substring(2, 9),
      nome: novoJogador.trim(),
      pontos: 0,
      acertos: 0,
      vezes: 0,
      bebidas: 0
    };
    
    setJogadores([...jogadores, novoJogadorObj]);
    setNovoJogador("");
  };
  
  const removerJogador = (id: string) => {
    setJogadores(jogadores.filter(j => j.id !== id));
  };
  
  const moverJogadorParaCima = (index: number) => {
    if (index <= 0) return;
    
    const novosJogadores = [...jogadores];
    const temp = novosJogadores[index];
    novosJogadores[index] = novosJogadores[index - 1];
    novosJogadores[index - 1] = temp;
    
    setJogadores(novosJogadores);
  };
  
  const moverJogadorParaBaixo = (index: number) => {
    if (index >= jogadores.length - 1) return;
    
    const novosJogadores = [...jogadores];
    const temp = novosJogadores[index];
    novosJogadores[index] = novosJogadores[index + 1];
    novosJogadores[index + 1] = temp;
    
    setJogadores(novosJogadores);
  };
  
  const prosseguir = () => {
    if (jogadores.length < 2) {
      toast({
        title: "Jogadores insuficientes",
        description: "Adicione pelo menos 2 jogadores para jogar",
        variant: "destructive",
      });
      return;
    }
    
    // Salvar jogadores e ir para a página de configurações
    localStorage.setItem('desenhaEBebeJogadores', JSON.stringify(jogadores));
    navigate("/desenha-e-bebe/configuracoes");
  };
  
  // Cores para os avatares dos jogadores
  const coresAvatar = [
    "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", 
    "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500"
  ];
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <GameLayout title="Desenha e Bebe" showPlayers={false}>
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Jogadores</CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4">
            <div className="mb-6">
              <div className="flex space-x-2">
                <Input
                  value={novoJogador}
                  onChange={(e) => setNovoJogador(e.target.value)}
                  placeholder="Nome do jogador"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarJogador();
                    }
                  }}
                />
                <Button 
                  onClick={adicionarJogador} 
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {jogadores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Adicione jogadores para começar</p>
                </div>
              ) : (
                jogadores.map((jogador, index) => (
                  <div 
                    key={jogador.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <Avatar className={`${coresAvatar[index % coresAvatar.length]} h-9 w-9 mr-3`}>
                        <AvatarFallback className="text-white">
                          {getInitials(jogador.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{jogador.nome}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => moverJogadorParaCima(index)}
                        disabled={index === 0}
                      >
                        <ChevronUpIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => moverJogadorParaBaixo(index)}
                        disabled={index === jogadores.length - 1}
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" 
                        onClick={() => removerJogador(jogador.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {jogadores.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <Badge variant="outline" className="text-sm">
                  {jogadores.length} {jogadores.length === 1 ? 'jogador' : 'jogadores'}
                </Badge>
                
                <Badge 
                  variant={jogadores.length >= 2 ? "default" : "destructive"}
                  className="text-sm"
                >
                  {jogadores.length >= 2 ? 'Pronto para jogar' : 'Mínimo de 2 jogadores'}
                </Badge>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate("/desenha-e-bebe")}
              className="border-purple-200 text-purple-700"
            >
              <CrossIcon className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            
            <Button 
              onClick={prosseguir}
              className="bg-purple-700 hover:bg-purple-800"
              disabled={jogadores.length < 2}
            >
              <ArrowRightIcon className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </GameLayout>
  );
}