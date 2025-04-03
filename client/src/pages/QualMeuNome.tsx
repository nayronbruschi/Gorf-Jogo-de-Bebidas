import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User2, 
  XCircle, 
  Clock, 
  Trophy, 
  ThumbsUp, 
  ThumbsDown, 
  Info,
  ArrowRight,
  Users,
  Star,
  Sparkles
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GameLayout } from '@/components/GameLayout';
import { AdBanner } from '@/components/AdBanner';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Player, GameSettings } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type CardType = string;

enum GameStep {
  WELCOME = 'welcome',
  PLAYER_SETUP = 'player_setup',
  RULES = 'rules',
  ROUND_INFO = 'round_info',
  GAMEPLAY = 'gameplay',
  RESULTS = 'results'
}

export default function QualMeuNome() {
  const queryClient = useQueryClient();
  
  // Estado do jogo
  const [gameStep, setGameStep] = useState<GameStep>(GameStep.WELCOME);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [cardsPerRound, setCardsPerRound] = useState(5);
  const [timePerCard, setTimePerCard] = useState(60);
  const [cardsRemaining, setCardsRemaining] = useState(cardsPerRound);
  const [currentCard, setCurrentCard] = useState<CardType | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [turnTimeLeft, setTurnTimeLeft] = useState(timePerCard);
  const [turnActive, setTurnActive] = useState(false);
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [showScore, setShowScore] = useState(false);
  
  // Estados da UI
  const [openRules, setOpenRules] = useState(false);
  const [openRoundInfo, setOpenRoundInfo] = useState(false);
  const [tempPlayerName, setTempPlayerName] = useState('');
  
  // Consultas de dados
  const { 
    data: playersData, 
    isLoading: isLoadingPlayers,
    isError: isErrorPlayers,
    refetch: refetchPlayers
  } = useQuery({
    queryKey: ['/api/players'],
    enabled: true
  });

  const { 
    data: currentPlayerData, 
    isLoading: isLoadingCurrentPlayer,
    refetch: refetchCurrentPlayer
  } = useQuery({
    queryKey: ['/api/players/current'],
    enabled: true
  });

  // Efeitos
  useEffect(() => {
    if (playersData) {
      setPlayers(playersData);
    }
  }, [playersData]);

  useEffect(() => {
    if (currentPlayerData) {
      setCurrentTurnPlayer(currentPlayerData);
    }
  }, [currentPlayerData]);

  // Efeito para controlar o tempo durante o turno
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (turnActive && turnTimeLeft > 0) {
      timerId = setInterval(() => {
        setTurnTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (turnTimeLeft === 0 && turnActive) {
      // Tempo esgotado
      handleTimeUp();
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [turnActive, turnTimeLeft]);

  // Seleção aleatória de personalidades
  const celebrities = [
    "Elvis Presley", "Madonna", "Michael Jackson", "Marilyn Monroe", 
    "Neymar", "Lionel Messi", "Cristiano Ronaldo", "Pelé",
    "Brad Pitt", "Angelina Jolie", "Tom Cruise", "Jennifer Lopez",
    "Freddie Mercury", "David Bowie", "Anitta", "Pablo Vittar",
    "Silvio Santos", "Xuxa", "Luciano Huck", "Ivete Sangalo",
    "Paulo Gustavo", "Tatá Werneck", "Pedro Pascal", "Bruna Marquezine",
    "Barack Obama", "Donald Trump", "Steve Jobs", "Bill Gates",
    "Elon Musk", "Mark Zuckerberg", "Jeff Bezos",
    "Frida Kahlo", "Pablo Picasso", "Leonardo da Vinci",
    "Albert Einstein", "Stephen Hawking", "Marie Curie",
    "Ayrton Senna", "Micheal Jordan", "LeBron James", "Serena Williams",
    "Walt Disney", "JK Rowling", "Stan Lee",
    "Lula", "Bolsonaro", "Dilma", "Temer",
    "Tim Maia", "Elis Regina", "Cazuza", "Raul Seixas"
  ];

  const popularBrands = [
    "Coca-Cola", "Pepsi", "Apple", "Samsung", 
    "Nike", "Adidas", "Uber", "Netflix",
    "McDonalds", "Burger King", "Starbucks", "Subway",
    "Google", "Microsoft", "Amazon", "Facebook",
    "PlayStation", "Xbox", "Nintendo", "Logitech",
    "Ferrari", "Lamborghini", "BMW", "Mercedes-Benz",
    "Banco do Brasil", "Itaú", "Bradesco", "Nubank",
    "Havaianas", "Natura", "Boticário", "Avon"
  ];

  const fictionalCharacters = [
    "Harry Potter", "Hermione Granger", "Ron Weasley", "Voldemort",
    "Darth Vader", "Luke Skywalker", "Princess Leia", "Yoda",
    "Batman", "Superman", "Wonder Woman", "Spider-Man",
    "Mario", "Luigi", "Donkey Kong", "Sonic",
    "Mickey Mouse", "Donald Duck", "Minnie Mouse", "Pateta",
    "Homer Simpson", "Marge Simpson", "Bart Simpson", "Lisa Simpson",
    "Shrek", "Fiona", "Burro", "Gato de Botas",
    "Jack Sparrow", "Capitão América", "Homem de Ferro", "Thor",
    "Bob Esponja", "Patrick", "Lula Molusco", "Plankton"
  ];

  // Funções do Jogo
  const generateDeck = () => {
    const deck: CardType[] = [];
    
    // Categorias misturadas
    const allOptions = [
      ...celebrities,
      ...popularBrands,
      ...fictionalCharacters
    ];
    
    // Embaralhar array
    const shuffled = [...allOptions].sort(() => 0.5 - Math.random());
    
    // Pegar cartas para todas as rodadas (5 cartas por rodada, 3 rodadas)
    const totalCards = cardsPerRound * 3;
    return shuffled.slice(0, totalCards);
  };

  const startGameFlow = () => {
    // Reiniciar jogo
    setRoundNumber(1);
    setScore(0);
    setShowResults(false);
    setGameStep(GameStep.PLAYER_SETUP);
    
    // Gerar novo baralho
    const newDeck = generateDeck();
    setAllCards(newDeck);
  };

  const startRound = () => {
    // Definir cartas para esta rodada
    const startIndex = (roundNumber - 1) * cardsPerRound;
    const roundCards = allCards.slice(startIndex, startIndex + cardsPerRound);
    
    // Configurar rodada
    setCardsRemaining(roundCards.length);
    setGameStep(GameStep.ROUND_INFO);
    setOpenRoundInfo(true);
  };

  const startTurn = () => {
    // Pegar próxima carta do baralho
    const startIndex = (roundNumber - 1) * cardsPerRound;
    const cardIndex = startIndex + (cardsPerRound - cardsRemaining);
    const nextCard = allCards[cardIndex];
    
    // Iniciar o turno
    setCurrentCard(nextCard);
    setTurnTimeLeft(timePerCard);
    setTurnActive(true);
    setShowScore(false);
  };

  const handleCorrectGuess = async () => {
    setTurnActive(false);
    setShowScore(true);
    
    const pointsEarned = 1;
    
    // Atualizar pontuação
    setScore(prev => prev + pointsEarned);
    
    // Atualizar pontos do jogador atual
    if (currentTurnPlayer) {
      try {
        await apiRequest(`/api/players/${currentTurnPlayer.id}/points`, {
          method: 'PATCH',
          data: {
            points: pointsEarned,
            type: 'challenge'
          }
        });
      
        // Atualizar dados locais e remotos
        refetchPlayers();
        refetchCurrentPlayer();
        queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      } catch (error) {
        toast({
          title: 'Erro ao atualizar pontos',
          description: 'Não foi possível atualizar os pontos do jogador.',
          variant: 'destructive'
        });
      }
    }
    
    // Avançar para próxima carta ou rodada
    handleNextCard();
  };

  const handleWrongGuess = () => {
    setTurnActive(false);
    setShowScore(true);
    
    // Avançar para próxima carta ou rodada
    handleNextCard();
  };

  const handleTimeUp = () => {
    // O tempo acabou, não ganhou pontos
    setTurnActive(false);
    setShowScore(true);
    
    // Avançar para próxima carta ou rodada
    handleNextCard();
  };

  const handleNextCard = () => {
    // Verificar se é a última carta da rodada
    if (cardsRemaining <= 1) {
      // Verificar se é a última rodada
      if (roundNumber >= 3) {
        // Fim do jogo
        setGameStep(GameStep.RESULTS);
        setShowResults(true);
      } else {
        // Próxima rodada
        setRoundNumber(prev => prev + 1);
        setTimeout(() => {
          startRound();
        }, 2000);
      }
    } else {
      // Próxima carta
      setCardsRemaining(prev => prev - 1);
      setTimeout(() => {
        startTurn();
      }, 2000);
    }
  };

  const handlePlayerNameSubmit = async () => {
    if (!tempPlayerName.trim()) {
      toast({
        title: 'Nome inválido',
        description: 'Por favor, digite um nome válido.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await apiRequest('/api/players', {
        method: 'POST',
        data: {
          name: tempPlayerName
        }
      });

      setTempPlayerName('');
      refetchPlayers();
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      toast({
        title: 'Jogador adicionado',
        description: 'Jogador adicionado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar jogador',
        description: 'Não foi possível adicionar o jogador.',
        variant: 'destructive'
      });
    }
  };

  const handleStartGame = () => {
    if (players.length < 2) {
      toast({
        title: 'Jogadores insuficientes',
        description: 'Adicione pelo menos 2 jogadores para iniciar o jogo.',
        variant: 'destructive'
      });
      return;
    }

    startGameFlow();
  };

  const handleRemovePlayer = async (id: string) => {
    try {
      await apiRequest(`/api/players/${id}`, {
        method: 'DELETE'
      });

      refetchPlayers();
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      toast({
        title: 'Jogador removido',
        description: 'Jogador removido com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover jogador',
        description: 'Não foi possível remover o jogador.',
        variant: 'destructive'
      });
    }
  };

  const handleClearPlayers = async () => {
    try {
      await apiRequest('/api/players', {
        method: 'DELETE'
      });

      refetchPlayers();
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      toast({
        title: 'Jogadores removidos',
        description: 'Todos os jogadores foram removidos com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover jogadores',
        description: 'Não foi possível remover os jogadores.',
        variant: 'destructive'
      });
    }
  };

  // Renderização condicional com base no estado do jogo
  const renderGameStep = () => {
    switch (gameStep) {
      case GameStep.WELCOME:
        return (
          <div className="flex flex-col gap-8 max-w-2xl mx-auto py-4">
            <Card className="border-gorf-purple/20">
              <CardHeader className="bg-gorf-purple/10 rounded-t-lg">
                <CardTitle className="text-2xl flex items-center gap-2 text-gorf-purple">
                  <Sparkles className="h-6 w-6" />
                  Qual Meu Nome
                </CardTitle>
                <CardDescription>
                  O jogo de adivinhação de personalidades, marcas e personagens!
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-slate-700 mb-4">
                  Faça os outros jogadores adivinharem quem é a personalidade, marca 
                  ou personagem mostrado na tela. Cada rodada tem regras diferentes 
                  para tornar o jogo mais desafiador!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <p className="font-semibold mb-1 text-gorf-purple">Rodada 1</p>
                    <p className="text-sm text-slate-700">Descrição livre</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <p className="font-semibold mb-1 text-gorf-purple">Rodada 2</p>
                    <p className="text-sm text-slate-700">Apenas uma palavra</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <p className="font-semibold mb-1 text-gorf-purple">Rodada 3</p>
                    <p className="text-sm text-slate-700">Mímica</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 sm:flex-row">
                <Button 
                  variant="outline"
                  onClick={() => setOpenRules(true)}
                  className="w-full sm:w-auto"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Ver Regras
                </Button>
                <Button 
                  onClick={() => setGameStep(GameStep.PLAYER_SETUP)}
                  className="w-full sm:w-auto bg-gorf-green hover:bg-green-700 text-white"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Começar
                </Button>
              </CardFooter>
            </Card>
          </div>
        );

      case GameStep.PLAYER_SETUP:
        return (
          <div className="flex flex-col gap-6 max-w-xl mx-auto py-4">
            <Card className="border-gorf-purple/20">
              <CardHeader className="bg-gorf-purple/10 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2 text-gorf-purple">
                  <Users className="h-5 w-5" />
                  Jogadores
                </CardTitle>
                <CardDescription>
                  Adicione os jogadores para começar. Mínimo de 2 jogadores.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Nome do jogador"
                    value={tempPlayerName}
                    onChange={(e) => setTempPlayerName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePlayerNameSubmit();
                      }
                    }}
                  />
                  <Button 
                    onClick={handlePlayerNameSubmit}
                    className="bg-gorf-purple hover:bg-purple-800 text-white"
                  >
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {isLoadingPlayers ? (
                    <div className="text-center py-4 text-slate-500">
                      Carregando jogadores...
                    </div>
                  ) : players.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 border border-dashed border-slate-300 rounded-lg">
                      Nenhum jogador adicionado
                    </div>
                  ) : (
                    players.map(player => (
                      <div 
                        key={player.id} 
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center">
                          <User2 className="w-4 h-4 mr-2 text-slate-500" />
                          <span>{player.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          onClick={() => handleRemovePlayer(player.id)}
                          className="h-8 w-8 p-0 text-slate-500"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                <Button 
                  variant="outline"
                  onClick={handleClearPlayers}
                  className="w-full sm:w-auto"
                >
                  Limpar Todos
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    onClick={() => setGameStep(GameStep.WELCOME)}
                    className="w-full sm:w-auto"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={handleStartGame}
                    disabled={players.length < 2}
                    className="w-full sm:w-auto bg-gorf-green hover:bg-green-700 text-white"
                  >
                    Jogar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        );

      case GameStep.GAMEPLAY:
        return (
          <div className="flex flex-col gap-6 max-w-xl mx-auto py-4">
            <Card className="border-gorf-purple/20">
              <CardHeader className="bg-gorf-purple/10 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl flex items-center gap-2 text-gorf-purple">
                    Rodada {roundNumber}
                    {roundNumber === 1 && <Badge className="ml-2 bg-gorf-purple">Descrição Livre</Badge>}
                    {roundNumber === 2 && <Badge className="ml-2 bg-gorf-purple">Apenas Uma Palavra</Badge>}
                    {roundNumber === 3 && <Badge className="ml-2 bg-gorf-purple">Mímica</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span className={turnTimeLeft < 10 ? "text-red-500 font-bold" : ""}>{turnTimeLeft}s</span>
                  </div>
                </div>
                <CardDescription>
                  {currentTurnPlayer?.name} está jogando • Carta {cardsPerRound - cardsRemaining + 1} de {cardsPerRound}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {showScore ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-xl font-bold">{currentCard}</div>
                    {score > 0 ? (
                      <div className="flex justify-center items-center">
                        <div className="bg-green-100 text-green-800 p-2 rounded-full">
                          <ThumbsUp className="h-8 w-8" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center">
                        <div className="bg-red-100 text-red-800 p-2 rounded-full">
                          <ThumbsDown className="h-8 w-8" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        {currentTurnPlayer?.name !== 'CPU' && (
                          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
                            <p className="text-lg font-bold text-gorf-purple mb-1">Mostre apenas para {currentTurnPlayer?.name}</p>
                            <p className="text-sm text-slate-600">Os outros jogadores não devem ver esta tela!</p>
                          </div>
                        )}
                      </div>
                      <div className="border-4 border-gorf-purple rounded-xl p-8 my-4 text-center">
                        {currentCard && (
                          <h3 className="text-3xl font-bold">{currentCard}</h3>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-4">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 font-medium mb-1">Instruções</p>
                        {roundNumber === 1 && (
                          <p className="text-slate-600 text-sm">
                            Dê dicas verbais sobre quem é a pessoa/marca/personagem.
                            Não pode falar o nome ou palavras derivadas.
                          </p>
                        )}
                        {roundNumber === 2 && (
                          <p className="text-slate-600 text-sm">
                            Use apenas UMA palavra para descrever cada carta.
                            Seja estratégico na escolha da palavra!
                          </p>
                        )}
                        {roundNumber === 3 && (
                          <p className="text-slate-600 text-sm">
                            Apenas mímica! Não pode falar nada.
                            Use apenas gestos para fazer os outros adivinharem.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex-col gap-2">
                {showScore ? (
                  <Button 
                    onClick={() => handleNextCard()}
                    className="w-full bg-gorf-green hover:bg-green-700 text-white"
                  >
                    Próxima Carta
                  </Button>
                ) : (
                  <div className="flex gap-3 w-full">
                    <Button 
                      variant="outline"
                      onClick={handleWrongGuess}
                      className="w-full text-red-500 hover:text-red-700"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Errou
                    </Button>
                    <Button 
                      onClick={handleCorrectGuess}
                      className="w-full bg-gorf-green hover:bg-green-700 text-white"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Acertou
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
            
            <div className="flex justify-between items-center px-2">
              <div className="text-sm text-slate-500">
                Rodada {roundNumber} de 3
              </div>
              <Progress
                value={(cardsPerRound - cardsRemaining + 1) * (100/cardsPerRound)}
                className="w-1/2 h-2"
              />
              <div className="text-sm text-slate-500">
                {cardsPerRound - cardsRemaining + 1}/{cardsPerRound}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Erro ao carregar o jogo</div>;
    }
  };

  // Componente principal
  return (
    <GameLayout 
      title=""
      className="bg-slate-50 text-slate-900"
      showPlayers={gameStep === GameStep.WELCOME || gameStep === GameStep.PLAYER_SETUP}
    >
      <AdBanner position="top" />
      
      {/* Dialogs */}
      <Dialog open={openRules} onOpenChange={setOpenRules}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Regras do Jogo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="flex items-start gap-3">
              <div className="bg-gorf-purple/20 p-2 rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-gorf-purple">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Rodada 1: Descrição Livre</h3>
                <p className="text-slate-600 text-sm">
                  O jogador vê uma carta com um nome e precisa dar dicas verbais sem usar o nome ou derivados.
                  Os outros jogadores tentam adivinhar quem é.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-gorf-purple/20 p-2 rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-gorf-purple">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Rodada 2: Apenas Uma Palavra</h3>
                <p className="text-slate-600 text-sm">
                  O jogador pode usar apenas UMA palavra como dica para cada carta.
                  Precisa ser mais estratégico!
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-gorf-purple/20 p-2 rounded-full h-9 w-9 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-gorf-purple">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Rodada 3: Mímica</h3>
                <p className="text-slate-600 text-sm">
                  O jogador não pode falar! Apenas gestos e mímicas são permitidos para
                  dar dicas sobre a carta.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={openRoundInfo} onOpenChange={setOpenRoundInfo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Rodada {roundNumber}</DialogTitle>
            <DialogDescription>
              {roundNumber === 1 && "Dê dicas verbais sobre o nome na carta."}
              {roundNumber === 2 && "Use apenas UMA palavra para descrever a pessoa."}
              {roundNumber === 3 && "Sem falar! Apenas mímicas são permitidas."}
              {roundNumber === 4 && "Rodada relâmpago! Descreva o mais rápido possível."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-4">
            <div className="bg-gorf-purple/20 p-4 rounded-full mb-4 mx-auto h-16 w-16 flex items-center justify-center">
              <span className="text-2xl font-bold text-gorf-purple">{roundNumber}</span>
            </div>
            
            <h3 className="font-bold text-xl mb-2">
              {roundNumber === 1 && "Descrição Livre"}
              {roundNumber === 2 && "Apenas Uma Palavra"}
              {roundNumber === 3 && "Mímica"}
              {roundNumber === 4 && "Rodada Relâmpago"}
            </h3>
            
            <p className="text-slate-600 mb-4">
              {currentTurnPlayer?.name || "Primeiro jogador"} começa!
            </p>
          </div>
          
          <Button 
            onClick={() => {
              setOpenRoundInfo(false);
              if (gameStep !== GameStep.GAMEPLAY) {
                setGameStep(GameStep.GAMEPLAY);
              }
              startTurn();
            }}
            className="w-full bg-gorf-green hover:bg-green-700 text-white"
          >
            Iniciar Rodada
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de resultados */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Fim de Jogo!</DialogTitle>
            <DialogDescription>
              Veja como os jogadores se saíram.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-center mb-6">
              <div className="bg-yellow-100 p-4 rounded-full border-2 border-yellow-300">
                <Trophy className="h-10 w-10 text-yellow-600" />
              </div>
            </div>
            
            <div className="space-y-4">
              {players
                .sort((a, b) => b.points - a.points)
                .map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 
                        ? 'bg-yellow-100 border border-yellow-300' 
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center">
                      {index === 0 && <Trophy className="w-5 h-5 mr-2 text-yellow-600" />}
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold">{player.points}</span>
                      <span className="text-sm text-slate-500 ml-1">pontos</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline"
              onClick={() => setGameStep(GameStep.WELCOME)}
              className="w-full sm:w-auto"
            >
              Menu Principal
            </Button>
            <Button 
              onClick={() => {
                setShowResults(false);
                startGameFlow();
              }}
              className="w-full sm:w-auto bg-gorf-green hover:bg-green-700 text-white"
            >
              Jogar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Renderiza a etapa atual do jogo */}
      {renderGameStep()}
      
    </GameLayout>
  );
}