import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User2, 
  XCircle, 
  Clock, 
  Trophy, 
  ThumbsUp, 
  ThumbsDown, 
  Info
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
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

type CardType = string;

export default function QualMeuNome() {
  const queryClient = useQueryClient();
  
  // Estado do jogo
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentCategory, setCurrentCategory] = useState("Personalidades");
  const [lightningRound, setLightningRound] = useState(false);
  const [timer, setTimer] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [currentCard, setCurrentCard] = useState<string | null>(null);
  const [guess, setGuess] = useState('');
  const [cards, setCards] = useState<CardType[]>([]);
  const [passedCards, setPassedCards] = useState<CardType[]>([]);
  const [correctGuesses, setCorrectGuesses] = useState<CardType[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    maxPoints: 10,
    currentPlayerId: null
  });
  
  // Modais
  const [openRules, setOpenRules] = useState(false);
  const [openRoundInfo, setOpenRoundInfo] = useState(false);
  
  // Adição de jogador
  const [playerName, setPlayerName] = useState('');
  
  // Dados das cartas - nomes de personalidades famosas, personagens, etc.
  const allCardData: CardType[] = [
    // Personalidades
    "Albert Einstein", "Pelé", "Madonna", "Michael Jackson", "Frida Kahlo",
    "Nelson Mandela", "Steve Jobs", "Marilyn Monroe", "Pablo Picasso", "Ayrton Senna",
    "Elvis Presley", "Beyoncé", "Neymar", "Adele", "Walt Disney",
    
    // Personagens fictícios
    "Harry Potter", "Darth Vader", "Mickey Mouse", "Super-Homem", "Batman",
    "Mulher-Maravilha", "Bob Esponja", "Homem-Aranha", "Branca de Neve", "Cinderela",
    "Simba", "Elsa", "Mario Bros", "Pikachu", "Sonic",
    
    // Personalidades brasileiras
    "Machado de Assis", "Silvio Santos", "Xuxa", "Paulo Freire", "Carmen Miranda",
    "Oscar Niemeyer", "Lula", "Caetano Veloso", "Tarsila do Amaral", "Tom Jobim",
    "Senna", "Ziraldo", "Fernanda Montenegro", "Chico Buarque", "Zico"
  ];
  
  // Consultas
  const { data: playerData, isLoading } = useQuery({
    queryKey: ['/api/players'],
    refetchInterval: 5000
  });
  
  const { data: settingsData } = useQuery({
    queryKey: ['/api/game-settings'],
    refetchInterval: 5000
  });
  
  // Efeitos
  useEffect(() => {
    if (playerData && Array.isArray(playerData)) {
      setPlayers(playerData as Player[]);
    }
  }, [playerData]);
  
  useEffect(() => {
    if (settingsData) {
      setGameSettings(settingsData as GameSettings);
    }
  }, [settingsData]);

  const addPlayer = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do jogador não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest(
        'POST',
        '/api/players',
        { name: playerName }
      );
      
      const player = await response.json() as Player;
      setPlayers([...players, player]);
      setPlayerName('');
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      toast({
        title: "Sucesso",
        description: `${player.name} adicionado ao jogo!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar jogador",
        variant: "destructive"
      });
    }
  };

  const removePlayer = async (id: string) => {
    try {
      await apiRequest(
        'DELETE',
        `/api/players/${id}`
      );

      setPlayers(players.filter(p => p.id !== id));
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      
      toast({
        title: "Sucesso",
        description: "Jogador removido do jogo!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover jogador",
        variant: "destructive"
      });
    }
  };

  const startGame = () => {
    if (players.length < 2) {
      toast({
        title: "Aviso",
        description: "Você precisa de pelo menos 2 jogadores para começar o jogo",
        variant: "destructive"
      });
      return;
    }

    // Distribuir cartas para o jogo
    const shuffledCards = [...allCardData].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, 30); // Selecionamos 30 cartas para o jogo
    setCards(selectedCards);
    
    setGameStarted(true);
    setRoundNumber(1);
    setCurrentPlayerIndex(0);
    setCurrentTurnPlayer(players[0]);
    setShowResults(false);
    setPassedCards([]);
    setCorrectGuesses([]);
    
    // Resetar pontuações
    resetPlayersPoints();
    
    // Mostrar informações da rodada
    setOpenRoundInfo(true);
  };

  const resetPlayersPoints = async () => {
    try {
      await apiRequest(
        'POST',
        '/api/players/reset'
      );
      
      // Atualiza os jogadores com pontuação zerada
      const updatedPlayers = players.map(p => ({
        ...p,
        points: 0,
        challengesCompleted: 0,
        drinksCompleted: 0
      }));
      
      setPlayers(updatedPlayers);
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao resetar pontuações",
        variant: "destructive"
      });
    }
  };

  const startTurn = () => {
    // Mostrar carta para o jogador atual
    if (cards.length > 0) {
      const randomCardIndex = Math.floor(Math.random() * cards.length);
      const selectedCard = cards[randomCardIndex];
      setCurrentCard(selectedCard);
      setShowCard(true);
      
      // Remover a carta do baralho
      const updatedCards = [...cards];
      updatedCards.splice(randomCardIndex, 1);
      setCards(updatedCards);
    } else {
      // Se não tiver mais cartas, finalizar rodada
      endRound();
      return;
    }
  };

  const startTimer = () => {
    setShowCard(false);
    setTimerRunning(true);
    setTimer(30);
  };

  useEffect(() => {
    let interval: number;
    
    if (timerRunning && timer > 0) {
      interval = window.setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timer === 0) {
      // Quando o tempo acabar
      setTimerRunning(false);
      endTurn();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timer]);

  const checkGuess = () => {
    if (!guess.trim()) return;
    
    if (guess.toLowerCase() === currentCard?.toLowerCase()) {
      // Acertou
      toast({
        title: "Correto!",
        description: "Você acertou!",
        variant: "default"
      });
      
      // Adicionar pontos
      addPointToCurrentPlayer();
      
      // Adicionar à lista de acertos
      setCorrectGuesses([...correctGuesses, currentCard]);
      
      // Próxima carta
      startTurn();
    } else {
      // Errou
      toast({
        title: "Errado!",
        description: "Continue tentando!",
        variant: "destructive"
      });
      
      // Na rodada 1, pode continuar tentando
      if (roundNumber !== 1) {
        // Nas outras rodadas, passa a carta
        setPassedCards([...passedCards, currentCard!]);
        startTurn();
      }
    }
    
    setGuess('');
  };

  const passCard = () => {
    if (currentCard) {
      setPassedCards([...passedCards, currentCard]);
      startTurn();
    }
  };

  const endTurn = () => {
    // Passar para o próximo jogador
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    setCurrentTurnPlayer(players[nextPlayerIndex]);
    
    // Verificar se todos os jogadores já jogaram
    if (nextPlayerIndex === 0) {
      // Todos jogaram, verificar se todas as cartas foram usadas
      if (cards.length === 0 && passedCards.length === 0) {
        endRound();
      } else {
        // Adicionar cartas passadas de volta ao baralho
        const updatedCards = [...cards, ...passedCards];
        setCards(updatedCards.sort(() => Math.random() - 0.5));
        setPassedCards([]);
        
        toast({
          title: "Nova volta",
          description: "Começando nova volta com os jogadores"
        });
      }
    }
    
    setTimerRunning(false);
    setTimer(30);
    setShowCard(false);
    setCurrentCard(null);
  };

  const endRound = () => {
    setTimerRunning(false);
    setShowCard(false);
    setCurrentCard(null);
    
    // Verificar se é o fim do jogo
    if (roundNumber === 3 || (roundNumber === 2 && !lightningRound)) {
      // Fim do jogo
      setShowResults(true);
    } else if (roundNumber === 2 && lightningRound) {
      // Rodada relâmpago
      setRoundNumber(4); // Rodada relâmpago é a 4
      setOpenRoundInfo(true);
    } else {
      // Próxima rodada
      setRoundNumber(prev => prev + 1);
      
      // Se for após a rodada 1, ir para a rodada 2
      if (roundNumber === 1) {
        setLightningRound(true);
      }
      
      // Mostrar informações da nova rodada
      setOpenRoundInfo(true);
      
      // Recuperar todas as cartas para a próxima rodada
      setCards([...correctGuesses, ...passedCards].sort(() => Math.random() - 0.5));
      setPassedCards([]);
      setCorrectGuesses([]);
    }
  };

  const addPointToCurrentPlayer = async () => {
    if (!currentTurnPlayer) return;
    
    try {
      const response = await apiRequest(
        'POST',
        `/api/players/${currentTurnPlayer.id}/points`,
        { 
          points: 1, 
          type: "challenge" 
        }
      );
      
      const updatedPlayer = await response.json() as Player;
      
      // Atualizar jogador na lista
      const updatedPlayers = players.map(p => 
        p.id === updatedPlayer.id ? updatedPlayer : p
      );
      
      setPlayers(updatedPlayers);
      setCurrentTurnPlayer(updatedPlayer);
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar pontos",
        variant: "destructive"
      });
    }
  };

  return (
    <GameLayout 
      title="Qual Meu Nome" 
      className="bg-slate-50 text-slate-900"
      showPlayers={!gameStarted}
    >
      <AdBanner position="top" />
      
      {!gameStarted ? (
        <div className="container mx-auto p-4">
          <Card className="mb-6 bg-white shadow-md border-none">
            <CardHeader className="pb-3 bg-blue-50 rounded-t-lg">
              <CardTitle className="text-center text-blue-800">Qual Meu Nome</CardTitle>
              <CardDescription className="text-center text-blue-600">
                Descubra nomes através de dicas! Um jogo de adivinhação rápido e divertido.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4 text-slate-700">
                Tente adivinhar o nome mostrado na carta através de dicas dadas por outros jogadores.
                O jogo tem 3 rodadas, cada uma com regras diferentes. Quem fizer mais pontos vence!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                <Button 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  onClick={() => setOpenRules(true)}
                >
                  Ver Regras
                </Button>
                <Button 
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  onClick={startGame}
                  disabled={players.length < 2}
                >
                  Começar Jogo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 bg-white shadow-md border-none">
            <CardHeader className="pb-3 bg-blue-50 rounded-t-lg">
              <CardTitle className="text-blue-800">Adicionar Jogadores</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Nome do jogador"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="border-slate-300"
                />
                <Button 
                  onClick={addPlayer}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Adicionar
                </Button>
              </div>
              
              {isLoading ? (
                <p className="text-center text-slate-500">Carregando jogadores...</p>
              ) : players.length === 0 ? (
                <p className="text-center text-slate-500">Nenhum jogador adicionado</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                      <div className="flex items-center">
                        <User2 className="w-5 h-5 mr-2 text-blue-700" />
                        <span>{player.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(player.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto p-4">
          {/* Header do jogo */}
          <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-2">
                <Trophy className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-medium">Rodada {roundNumber}</h3>
                <p className="text-sm text-slate-500">{lightningRound ? "Rodada Relâmpago" : `Categoria: ${currentCategory}`}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-2">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
              <span className="text-xl font-bold">{timer}s</span>
            </div>
          </div>
          
          {/* Área principal do jogo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Jogador atual */}
            <Card className="md:col-span-1 bg-white shadow-sm border-none">
              <CardHeader className="pb-2 bg-blue-50 rounded-t-lg">
                <CardTitle className="text-blue-800 text-lg">Jogador Atual</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {currentTurnPlayer ? (
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-blue-100 p-4 mb-2">
                      <User2 className="w-8 h-8 text-blue-700" />
                    </div>
                    <h3 className="text-xl font-bold">{currentTurnPlayer.name}</h3>
                    <p className="text-sm text-slate-500">Pontos: {currentTurnPlayer.points}</p>
                  </div>
                ) : (
                  <p className="text-center text-slate-500">Selecione um jogador</p>
                )}
                
                {!timerRunning && !showCard && (
                  <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={startTurn}
                  >
                    Ver Carta
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Área da carta */}
            <Card className="md:col-span-2 bg-white shadow-sm border-none min-h-[200px] flex flex-col">
              <CardHeader className="pb-2 bg-blue-50 rounded-t-lg">
                <CardTitle className="text-blue-800 text-lg">
                  {showCard ? "Sua Carta" : timerRunning ? "Tempo Restante" : "Aguardando..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-grow flex flex-col justify-center items-center">
                {showCard && currentCard ? (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">{currentCard}</h2>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={startTimer}
                    >
                      Começar Tempo
                    </Button>
                  </div>
                ) : timerRunning ? (
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-3xl font-bold text-blue-800">{timer}</span>
                      </div>
                    </div>
                    
                    <div className="w-full max-w-md">
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Digite sua resposta..."
                          value={guess}
                          onChange={(e) => setGuess(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
                          className="border-slate-300"
                        />
                        <Button 
                          onClick={checkGuess}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Verificar
                        </Button>
                      </div>
                      
                      {roundNumber !== 1 && (
                        <Button 
                          variant="outline"
                          onClick={passCard}
                          className="w-full border-slate-300 text-slate-700"
                        >
                          Passar
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500">
                    {currentCard ? "Tempo esgotado!" : "Aguardando início..."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Placar do jogo */}
          <Card className="bg-white shadow-sm border-none">
            <CardHeader className="pb-2 bg-blue-50 rounded-t-lg">
              <CardTitle className="text-blue-800 text-lg">Placar</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {players.map(player => (
                  <div 
                    key={player.id} 
                    className={`p-3 rounded-lg ${
                      currentTurnPlayer?.id === player.id 
                        ? 'bg-blue-100 border-2 border-blue-300' 
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <User2 className="w-4 h-4 mr-1 text-blue-700" />
                      <span className="text-sm font-medium truncate">{player.name}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold">{player.points}</span>
                      <span className="text-xs text-slate-500 ml-1">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Modais */}
      
      {/* Modal de Regras */}
      <Dialog open={openRules} onOpenChange={setOpenRules}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-800 text-xl">Regras do Jogo</DialogTitle>
            <DialogDescription className="text-slate-600">
              Como jogar "Qual Meu Nome"
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="introducao">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="introducao">Introdução</TabsTrigger>
              <TabsTrigger value="rodadas">Rodadas</TabsTrigger>
              <TabsTrigger value="pontuacao">Pontuação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="introducao" className="text-slate-700">
              <p className="mb-2">
                <strong>Qual Meu Nome</strong> é um jogo de adivinhação de nomes dividido em 3 rodadas.
              </p>
              <p className="mb-2">
                Em cada rodada, um jogador por vez terá que dar pistas para que os outros adivinhem 
                um nome mostrado na carta.
              </p>
              <p>
                O jogo gira em torno de adivinhar nomes de pessoas reais ou fictícias,
                baseando-se em dicas dentro das restrições de cada rodada.
              </p>
            </TabsContent>
            
            <TabsContent value="rodadas" className="text-slate-700">
              <h3 className="font-bold mb-1">Rodada 1:</h3>
              <p className="mb-3">
                Você pode falar, fazer gestos e sons, mas não pode dizer qualquer parte do nome
                a ser adivinhado. Os demais jogadores podem dar quantos palpites quiserem.
              </p>
              
              <h3 className="font-bold mb-1">Rodada 2:</h3>
              <p className="mb-3">
                Você só pode dizer UMA palavra como dica (e repeti-la). 
                Os jogadores têm apenas um palpite por carta. É permitido passar.
              </p>
              
              <h3 className="font-bold mb-1">Rodada 3:</h3>
              <p>
                Você só pode fazer mímica, sem sons ou palavras.
                Os jogadores têm apenas um palpite por carta. É permitido passar.
              </p>
            </TabsContent>
            
            <TabsContent value="pontuacao" className="text-slate-700">
              <p className="mb-2">
                Cada jogador ganha 1 ponto toda vez que alguém acerta o nome da sua carta.
              </p>
              <p className="mb-2">
                Ao final de todas as rodadas, o jogador com mais pontos é o vencedor.
              </p>
              <p>
                O objetivo é tentar adivinhar o máximo de nomes possível dentro do tempo
                limitado de 30 segundos por turno.
              </p>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              onClick={() => setOpenRules(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Informação da Rodada */}
      <Dialog open={openRoundInfo} onOpenChange={setOpenRoundInfo}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-800 text-xl">
              {roundNumber === 4 ? "Rodada Relâmpago!" : `Rodada ${roundNumber}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-slate-700">
            {roundNumber === 1 && (
              <>
                <h3 className="font-bold text-lg mb-2">Regras para a Rodada 1:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Você pode falar, fazer gestos e sons</li>
                  <li>Não pode dizer qualquer parte do nome na carta</li>
                  <li>Não pode soletrar</li>
                  <li>Os jogadores podem dar quantos palpites quiserem</li>
                  <li>Não é permitido passar a carta</li>
                </ul>
              </>
            )}
            
            {roundNumber === 2 && (
              <>
                <h3 className="font-bold text-lg mb-2">Regras para a Rodada 2:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Você só pode dizer UMA palavra (e repeti-la)</li>
                  <li>Pode fazer mímica</li>
                  <li>Os jogadores têm apenas um palpite por carta</li>
                  <li>É permitido passar a carta</li>
                </ul>
              </>
            )}
            
            {roundNumber === 3 && (
              <>
                <h3 className="font-bold text-lg mb-2">Regras para a Rodada 3:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Você só pode fazer mímica</li>
                  <li>Não pode falar nem fazer sons</li>
                  <li>Os jogadores têm apenas um palpite por carta</li>
                  <li>É permitido passar a carta</li>
                </ul>
              </>
            )}
            
            {roundNumber === 4 && (
              <>
                <h3 className="font-bold text-lg mb-2">Rodada Relâmpago:</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Tempo reduzido para 15 segundos</li>
                  <li>Todas as cartas estão em jogo</li>
                  <li>Não há restrições - use qualquer método</li>
                  <li>Pontuação dobrada para cada acerto</li>
                </ul>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setOpenRoundInfo(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Começar!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Resultados */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-blue-800 text-xl">Fim de Jogo!</DialogTitle>
            <DialogDescription className="text-slate-600">
              Veja quem venceu "Qual Meu Nome"
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-bold text-lg mb-4 text-center">Placar Final</h3>
            
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
              onClick={() => setGameStarted(false)}
              className="w-full sm:w-auto"
            >
              Menu Principal
            </Button>
            <Button 
              onClick={() => {
                setShowResults(false);
                startGame();
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              Jogar Novamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}