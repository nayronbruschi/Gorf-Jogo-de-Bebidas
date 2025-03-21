import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth, getUserProfile } from "@/lib/firebase";
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BrazilHeatMap } from "@/components/BrazilHeatMap";

// Lista de cidades brasileiras para simulação
const BRASIL_CIDADES = [
  { nome: "São Paulo", estado: "SP", 
    latitude: -23.5505, longitude: -46.6333, populacao: 12.33 },
  { nome: "Rio de Janeiro", estado: "RJ", 
    latitude: -22.9068, longitude: -43.1729, populacao: 6.75 },
  { nome: "Brasília", estado: "DF", 
    latitude: -15.7942, longitude: -47.8825, populacao: 3.05 },
  { nome: "Salvador", estado: "BA", 
    latitude: -12.9714, longitude: -38.5014, populacao: 2.9 },
  { nome: "Fortaleza", estado: "CE", 
    latitude: -3.7318, longitude: -38.5267, populacao: 2.7 },
  { nome: "Belo Horizonte", estado: "MG", 
    latitude: -19.9167, longitude: -43.9345, populacao: 2.52 },
  { nome: "Manaus", estado: "AM", 
    latitude: -3.1019, longitude: -60.0251, populacao: 2.22 },
  { nome: "Curitiba", estado: "PR", 
    latitude: -25.4284, longitude: -49.2733, populacao: 1.95 },
  { nome: "Recife", estado: "PE", 
    latitude: -8.0539, longitude: -34.8811, populacao: 1.65 },
  { nome: "Porto Alegre", estado: "RS", 
    latitude: -30.0277, longitude: -51.2287, populacao: 1.48 },
  { nome: "Belém", estado: "PA", 
    latitude: -1.4558, longitude: -48.4902, populacao: 1.49 },
  { nome: "Goiânia", estado: "GO", 
    latitude: -16.6799, longitude: -49.255, populacao: 1.49 },
  { nome: "Florianópolis", estado: "SC", 
    latitude: -27.5969, longitude: -48.5495, populacao: 0.51 },
  { nome: "Vitória", estado: "ES", 
    latitude: -20.2976, longitude: -40.2958, populacao: 0.36 },
  { nome: "Natal", estado: "RN", 
    latitude: -5.7945, longitude: -35.211, populacao: 0.89 },
  { nome: "Campo Grande", estado: "MS", 
    latitude: -20.4697, longitude: -54.6201, populacao: 0.9 },
  { nome: "João Pessoa", estado: "PB", 
    latitude: -7.115, longitude: -34.8631, populacao: 0.82 },
  { nome: "Teresina", estado: "PI", 
    latitude: -5.0948, longitude: -42.8035, populacao: 0.87 },
  { nome: "Cuiabá", estado: "MT", 
    latitude: -15.601, longitude: -56.0974, populacao: 0.62 },
  { nome: "Maceió", estado: "AL", 
    latitude: -9.6498, longitude: -35.7089, populacao: 1.02 },
  { nome: "Campinas", estado: "SP", 
    latitude: -22.9099, longitude: -47.0626, populacao: 1.22 },
  { nome: "Ribeirão Preto", estado: "SP", 
    latitude: -21.1767, longitude: -47.8208, populacao: 0.71 },
  { nome: "São Luís", estado: "MA", 
    latitude: -2.5297, longitude: -44.3026, populacao: 1.12 },
  { nome: "Aracaju", estado: "SE", 
    latitude: -10.9472, longitude: -37.0731, populacao: 0.66 },
  { nome: "Maringá", estado: "PR", 
    latitude: -23.4205, longitude: -51.9333, populacao: 0.43 }
];

// Nomes comuns brasileiros para simulação
const NOMES_BRASILEIROS = [
  "João Silva", "Maria Santos", "Carlos Oliveira", "Ana Souza", "Pedro Costa",
  "Juliana Lima", "André Pereira", "Patricia Almeida", "Lucas Rodrigues", "Fernanda Gomes",
  "Ricardo Martins", "Carolina Ferreira", "Bruno Ribeiro", "Amanda Carvalho", "Gustavo Araújo",
  "Isabela Nascimento", "Marcelo Barbosa", "Camila Mendes", "Daniel Barros", "Letícia Cardoso"
];

interface SimulationStats {
  usersCreated: number;
  locationsAdded: number;
  sessionsCreated: number;
  gamesRegistered: number;
}

export default function AdminGeoTest() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<SimulationStats>({
    usersCreated: 0,
    locationsAdded: 0,
    sessionsCreated: 0,
    gamesRegistered: 0
  });
  const [userCount, setUserCount] = useState(15);
  const [registerGames, setRegisterGames] = useState(true);
  const [registerLocations, setRegisterLocations] = useState(true);
  const [includeCurrentUser, setIncludeCurrentUser] = useState(true);
  const [simulationID, setSimulationID] = useState("");
  const [heatMapPoints, setHeatMapPoints] = useState<{lat: number, lng: number, intensity?: number}[]>([]);

  useEffect(() => {
    // Verificar se o usuário é o admin
    const currentUser = auth.currentUser;
    if (currentUser?.email === "nayronbruschi@gmail.com") {
      setIsAuthenticated(true);
      // Gerar ID único para a simulação
      setSimulationID(`sim_${Date.now().toString(36)}`);
    }
  }, []);

  // Gerar nome aleatório
  const randomName = () => {
    return NOMES_BRASILEIROS[Math.floor(Math.random() * NOMES_BRASILEIROS.length)];
  };

  // Gerar cidade aleatória com preferência para cidades maiores
  const getRandomCity = () => {
    // Dar mais peso para cidades com maior população
    const totalPopulation = BRASIL_CIDADES.reduce((sum, cidade) => sum + cidade.populacao, 0);
    let randomPoint = Math.random() * totalPopulation;
    let currentSum = 0;
    
    for (const cidade of BRASIL_CIDADES) {
      currentSum += cidade.populacao;
      if (currentSum >= randomPoint) {
        return cidade;
      }
    }
    
    // Fallback
    return BRASIL_CIDADES[0];
  };

  // Gerar dados de jogos aleatórios
  const generateRandomGames = () => {
    const gameNames = [
      "Verdade ou Desafio", "Modo Clássico", "Roleta", "Girar a Garrafa", 
      "Toque na Sorte", "Quem Sou Eu", "Cara ou Coroa", "Jogo de Cartas"
    ];
    
    const gamesPlayed = Math.floor(Math.random() * 10) + 1; // 1 a 10 jogos
    const recentGames = [];
    
    for (let i = 0; i < Math.min(gamesPlayed, 10); i++) {
      // Data aleatória nos últimos 30 dias
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      recentGames.push({
        name: gameNames[Math.floor(Math.random() * gameNames.length)],
        playedAt: randomDate.toISOString()
      });
    }
    
    return {
      totalGamesPlayed: gamesPlayed,
      recentGames,
      victories: Math.floor(Math.random() * gamesPlayed),
      lastGamePlayed: recentGames[0]?.name || null,
      totalPlayTime: Math.floor(Math.random() * 120),
      lastGameStartTime: recentGames[0]?.playedAt || null
    };
  };

  const simulateUsers = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado como administrador.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);
      
      const db = getFirestore();
      const newStats: SimulationStats = {
        usersCreated: 0,
        locationsAdded: 0,
        sessionsCreated: 0,
        gamesRegistered: 0
      };
      
      // Limpar os pontos do mapa de calor anteriores
      const newHeatMapPoints: {lat: number, lng: number, intensity?: number}[] = [];
      
      // Incluir usuário atual se selecionado
      if (includeCurrentUser) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userProfile = await getUserProfile(currentUser.uid);
          
          if (userProfile && registerLocations) {
            // Atribuir uma localização aleatória ao usuário atual
            const cidade = getRandomCity();
            const lat = cidade.latitude;
            const lng = cidade.longitude;
            
            await setDoc(doc(db, "users", currentUser.uid), {
              ...userProfile,
              lastLocation: {
                latitude: lat,
                longitude: lng,
                city: cidade.nome,
                state: cidade.estado,
                lastUpdated: Timestamp.now()
              }
            }, { merge: true });
            
            // Adicionar ponto ao mapa de calor
            newHeatMapPoints.push({
              lat,
              lng,
              intensity: 0.8 // Usuário atual tem maior intensidade
            });
            
            newStats.locationsAdded++;
            
            setProgress(5);
            setStats(prevStats => ({
              ...prevStats,
              locationsAdded: prevStats.locationsAdded + 1
            }));
          }
          
          // Registrar login
          await setDoc(doc(db, "userSessions", `${currentUser.uid}_${Date.now()}`), {
            userId: currentUser.uid,
            timestamp: Timestamp.now(),
            simulationId: simulationID
          });
          
          newStats.sessionsCreated++;
          
          setProgress(10);
          setStats(prevStats => ({
            ...prevStats,
            sessionsCreated: prevStats.sessionsCreated + 1
          }));
        }
      }
      
      // Criar usuários simulados
      const totalSteps = userCount * (registerLocations ? 2 : 1) * (registerGames ? 2 : 1);
      let currentStep = 0;
      
      for (let i = 0; i < userCount; i++) {
        const userId = `sim_user_${simulationID}_${i}`;
        const nome = randomName();
        const cidade = getRandomCity();
        const createdAt = new Timestamp(
          Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 30 * 86400), 
          0
        );
        
        // Criar perfil de usuário
        await setDoc(doc(db, "users", userId), {
          id: userId,
          name: nome,
          email: `${nome.toLowerCase().replace(' ', '.')}@exemplo.com`,
          createdAt: createdAt,
          updatedAt: Timestamp.now(),
          gender: Math.random() > 0.5 ? "homem" : "mulher",
          birthDate: `${1980 + Math.floor(Math.random() * 25)}-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
          favoriteDrinks: ["Cerveja", "Vinho", "Água"],
          favoriteSocialNetwork: ["instagram", "tiktok", "X", "facebook"][Math.floor(Math.random() * 4)],
          lastLogin: Timestamp.now(),
          simulationId: simulationID
        });
        
        newStats.usersCreated++;
        currentStep++;
        setProgress(Math.floor((currentStep / totalSteps) * 100));
        
        // Adicionar localização se solicitado
        if (registerLocations) {
          await setDoc(doc(db, "users", userId), {
            lastLocation: {
              latitude: cidade.latitude + (Math.random() * 0.01 - 0.005),
              longitude: cidade.longitude + (Math.random() * 0.01 - 0.005),
              city: cidade.nome,
              state: cidade.estado,
              lastUpdated: Timestamp.now()
            }
          }, { merge: true });
          
          newStats.locationsAdded++;
          currentStep++;
          setProgress(Math.floor((currentStep / totalSteps) * 100));
        }
        
        // Adicionar dados de jogos se solicitado
        if (registerGames) {
          const gameStats = generateRandomGames();
          
          await setDoc(doc(db, "users", userId), {
            gameStats: {
              ...gameStats,
              userId: userId
            }
          }, { merge: true });
          
          newStats.gamesRegistered++;
          currentStep++;
          setProgress(Math.floor((currentStep / totalSteps) * 100));
        }
        
        // Criar sessão de login
        await setDoc(doc(db, "userSessions", `${userId}_${Date.now()}`), {
          userId: userId,
          timestamp: Timestamp.now(),
          simulationId: simulationID
        });
        
        newStats.sessionsCreated++;
        currentStep++;
        setProgress(Math.floor((currentStep / totalSteps) * 100));
        
        // Atualizar estatísticas a cada usuário
        setStats(newStats);
        
        // Pausa para não sobrecarregar o Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setProgress(100);
      
      toast({
        title: "Simulação concluída",
        description: `Criados ${newStats.usersCreated} usuários com ${newStats.locationsAdded} localizações e ${newStats.gamesRegistered} estatísticas de jogos.`,
      });
    } catch (error) {
      console.error("Erro ao simular usuários:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao simular usuários.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 max-w-md">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Acesso Restrito</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 mb-4">
                Você precisa estar logado como administrador para acessar esta página.
              </p>
              <Button onClick={() => navigate("/admin")} className="w-full">
                Voltar para Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Simulação Geográfica - Admin</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin")}
            className="text-white/80 border-white/20 hover:bg-white/10"
          >
            Voltar para Dashboard
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Simulação de Dados Geográficos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-purple-800/20 rounded-lg border border-purple-700/20 mb-4">
              <h3 className="text-white font-semibold mb-2">⚠️ Importante</h3>
              <p className="text-white/80 text-sm">
                Esta ferramenta irá criar dados simulados no Firebase para teste do dashboard.
                Os dados incluirão usuários fictícios com localizações em diferentes cidades do Brasil
                e estatísticas de uso do aplicativo.
              </p>
              <p className="text-white/80 text-sm mt-2">
                ID da simulação: <span className="font-mono">{simulationID}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Número de usuários simulados</label>
                <Slider
                  value={[userCount]}
                  onValueChange={(value) => setUserCount(value[0])}
                  min={5}
                  max={50}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-white/60">
                  <span>5</span>
                  <span>{userCount}</span>
                  <span>50</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="register-locations"
                  checked={registerLocations}
                  onCheckedChange={setRegisterLocations}
                />
                <Label htmlFor="register-locations" className="text-white/80">
                  Incluir dados de localização
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="register-games"
                  checked={registerGames}
                  onCheckedChange={setRegisterGames}
                />
                <Label htmlFor="register-games" className="text-white/80">
                  Incluir estatísticas de jogos
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-current"
                  checked={includeCurrentUser}
                  onCheckedChange={setIncludeCurrentUser}
                />
                <Label htmlFor="include-current" className="text-white/80">
                  Incluir usuário atual na simulação
                </Label>
              </div>

              <Button
                onClick={simulateUsers}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? "Gerando dados..." : "Iniciar Simulação"}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-white/60 text-xs text-center">{progress}% concluído</p>
                </div>
              )}

              {(stats.usersCreated > 0 || stats.locationsAdded > 0 || stats.sessionsCreated > 0) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <div className="text-white font-medium">Usuários</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.usersCreated}</div>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <div className="text-white font-medium">Localizações</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.locationsAdded}</div>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <div className="text-white font-medium">Sessões</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.sessionsCreated}</div>
                  </div>
                  <div className="bg-purple-900/30 p-3 rounded-lg">
                    <div className="text-white font-medium">Jogos</div>
                    <div className="text-2xl font-bold text-purple-300">{stats.gamesRegistered}</div>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/admin")}
                  className="text-white/80 border-white/20 hover:bg-white/10"
                >
                  Voltar para Dashboard
                </Button>

                {(stats.usersCreated > 0) && (
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="ghost"
                    className="text-white/80 hover:bg-white/10"
                  >
                    Reiniciar Simulador
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}