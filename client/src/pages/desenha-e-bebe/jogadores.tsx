import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Trash2, UserPlus, PlayCircle, HelpCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { startGameSession, updateGameStats } from "@/lib/firebase";

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
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [novoJogador, setNovoJogador] = useState("");
  const [regrasDialogOpen, setRegrasDialogOpen] = useState(false);
  
  // Registrar o jogo nas estatísticas do usuário quando a página for carregada
  useEffect(() => {
    const userId = localStorage.getItem('dev_session');
    if (userId) {
      startGameSession(userId, "Desenha e Bebe");
      updateGameStats(userId, "Desenha e Bebe");
    }
  }, []);
  
  // Funções para gerenciar jogadores
  const adicionarJogador = () => {
    if (!novoJogador.trim()) return;
    
    if (jogadores.length >= 8) {
      toast({
        title: "Limite de jogadores atingido",
        description: "Máximo de 8 jogadores permitido",
        variant: "destructive",
      });
      return;
    }
    
    if (jogadores.some(j => j.nome.toLowerCase() === novoJogador.toLowerCase())) {
      toast({
        title: "Jogador já existe",
        description: "Use um nome diferente",
        variant: "destructive",
      });
      return;
    }
    
    setJogadores([
      ...jogadores,
      {
        id: Date.now().toString(),
        nome: novoJogador,
        pontos: 0,
        acertos: 0,
        vezes: 0,
        bebidas: 0
      }
    ]);
    
    setNovoJogador("");
  };

  const removerJogador = (id: string) => {
    setJogadores(jogadores.filter(j => j.id !== id));
  };
  
  const iniciarJogo = () => {
    if (jogadores.length < 2) {
      toast({
        title: "Jogadores insuficientes",
        description: "Adicione pelo menos 2 jogadores para começar",
        variant: "destructive",
      });
      return;
    }
    
    // Salvar jogadores no localStorage para compartilhar entre as páginas
    localStorage.setItem('desenhaEBebeJogadores', JSON.stringify(jogadores));
    
    // Navegar para a página de configurações
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
        <Card className="w-full max-w-3xl">
          <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-center">Jogadores</CardTitle>
            <CardDescription className="text-center text-gray-200">
              Adicione jogadores para começar a diversão!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="flex space-x-2">
              <Input
                placeholder="Nome do jogador"
                value={novoJogador}
                onChange={(e) => setNovoJogador(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    adicionarJogador();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={adicionarJogador} className="bg-purple-700 hover:bg-purple-800">
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            
            {jogadores.length > 0 ? (
              <div className="space-y-2">
                <div className="text-lg font-semibold text-purple-900 mb-2">Jogadores ({jogadores.length}/8):</div>
                {jogadores.map((jogador, index) => (
                  <div 
                    key={jogador.id} 
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className={coresAvatar[index % coresAvatar.length]}>
                        <AvatarFallback className="text-white">
                          {getInitials(jogador.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-800">{jogador.nome}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removerJogador(jogador.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Nenhum jogador adicionado</AlertTitle>
                <AlertDescription>
                  Adicione pelo menos 2 jogadores para começar o jogo.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setRegrasDialogOpen(true)}
              className="w-full sm:w-auto border-purple-200 text-purple-700"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Regras
            </Button>
            
            <Button 
              onClick={iniciarJogo} 
              disabled={jogadores.length < 2}
              className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Dialog para mostrar as regras */}
      <Dialog open={regrasDialogOpen} onOpenChange={setRegrasDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Regras do Jogo</DialogTitle>
            <DialogDescription className="text-center">
              Como jogar Desenha e Bebe
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-bold text-purple-900">Como funciona:</h3>
              <p className="text-sm text-gray-700">
                1. Um jogador recebe uma palavra secreta e deve desenhá-la ou mimicá-la.
              </p>
              <p className="text-sm text-gray-700">
                2. Os outros precisam adivinhar a palavra dentro do tempo limite.
              </p>
              <p className="text-sm text-gray-700">
                3. Se adivinharem, o jogador que desenhou ganha pontos. Caso contrário, bebe!
              </p>
              <p className="text-sm text-gray-700">
                4. O jogo continua até que alguém atinja a pontuação de vitória.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-bold text-purple-900">Dicas:</h3>
              <p className="text-sm text-gray-700">
                • O jogador que desenha NÃO pode falar ou escrever letras/números.
              </p>
              <p className="text-sm text-gray-700">
                • Você pode personalizar o tempo, as categorias de palavras e mais nas configurações.
              </p>
              <p className="text-sm text-gray-700">
                • Quanto mais difícil a categoria, mais goles terá que beber em caso de erro!
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <Button type="button" className="bg-purple-700 hover:bg-purple-800" onClick={() => setRegrasDialogOpen(false)}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}