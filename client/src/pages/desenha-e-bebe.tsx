import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { shuffle } from "@/lib/utils";
import { GameLayout } from "@/components/GameLayout";
import { startGameSession, updateGameStats } from "@/lib/firebase";
import { 
  AlertCircle,
  Check,
  Crown, 
  Clock, 
  Dice6, 
  Pencil, 
  HelpCircle, 
  Hourglass, 
  SkipForward,
  Trophy,
  PlayCircle,
  ArrowLeft,
  ArrowRight,
  Palette,
  AlertTriangle,
  Drama,
  Target,
  Timer,
  Eye,
  Info,
  Layers,
  PartyPopper,
  Settings2,
  Trash2,
  UserPlus,
  Users2,
  X
} from "lucide-react";

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

// Palavras por categoria
const PALAVRAS: Record<string, string[]> = {
  pessoa: [
    "Barman", "Bêbado", "Garçom", "Dançarino", "Cantor de karaokê", "DJ", 
    "Segurança de festa", "Anfitrião", "Bartender", "Pessoa de ressaca",
    "Cachorro", "Gato", "Pinguim", "Macaco", "Girafa", "Elefante", 
    "Jacaré", "Urso", "Leão", "Cavalo"
  ],
  lugar: [
    "Bar", "Balada", "Festa na piscina", "Churrasco", "Festival", "Pub", 
    "Taverna", "Boate", "Praia", "Show", "Casa noturna", "Karaokê", 
    "Destilaria", "Adega", "Terraço", "Festa na cobertura", "Luau",
    "Cervejaria", "Restaurante", "Festa em casa"
  ],
  objeto: [
    "Taça de vinho", "Garrafa de cerveja", "Canudo", "Saca-rolhas", "Coqueteleira", 
    "Barril", "Shot", "Abridor de garrafa", "Cooler", "Guardanapo", "Petisco", 
    "Dose", "Jarra", "Copo americano", "Long neck", "Gelo", "Limão", "Azeitona",
    "Porta-copos", "Petisqueira"
  ],
  acao: [
    "Brindar", "Dançar", "Cantar karaokê", "Jogar sinuca", "Fazer careta", 
    "Cair da cadeira", "Derrubando bebida", "Misturando drinks", "Contando piada", 
    "Dormindo na mesa", "Fazendo malabarismo", "Cambaleando", "Tropeçando",
    "Tirando selfie", "Assobiando", "Aplaudindo", "Gargalhando", 
    "Acenando", "Arrotando", "Bocejando"
  ],
  expressao: [
    "Lá vem chumbo", "De olho no lance", "Caindo aos pedaços", "Tô legal", 
    "A noite é uma criança", "Virar a mesa", "Tô voando", "Cara de pau", 
    "Mão na roda", "Fazer das tripas coração", "Encher a cara", "Dar o pé",
    "Soltar os cachorros", "Dar uma banda", "Pegar no pé", "Bombar a festa",
    "Estar no clima", "De vento em popa", "Com a corda toda", "Tirar onda"
  ],
  aleatorio: [
    "Hangover", "Ice bucket challenge", "Ressaca", "Festa do pijama", "Boteco", 
    "Happy hour", "Open bar", "Drinque", "Aperitivo", "Gelo seco", "Jogo da garrafa",
    "Tapinha nas costas", "Cheiro de cerveja", "Balançando o copo", "After party",
    "DJ tocando", "Bebida derramada", "Foto de grupo", "Saúde!", "Decoração de festa"
  ],
  bebida: [
    "Caipirinha", "Mojito", "Gin tônica", "Margarita", "Piña Colada", "Bloody Mary", 
    "Cosmopolitan", "Daiquiri", "Manhattan", "Cerveja artesanal", "Vinho tinto", 
    "Champanhe", "Aperol Spritz", "Whisky", "Cachaça", "Tequila", "Sake", 
    "Espumante", "Moscow Mule", "Old Fashioned"
  ]
};

// Níveis de bebida por dificuldade
const NIVEIS_BEBIDA = [
  { dificuldade: 1, quantidade: "Gole pequeno", descricao: "Um gole rápido da sua bebida" },
  { dificuldade: 2, quantidade: "Gole médio", descricao: "Dois goles da sua bebida" },
  { dificuldade: 3, quantidade: "Gole grande", descricao: "Três goles da sua bebida ou um shot" },
];

// Tipos de jogador
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

// Estado do jogo
type EstadoJogo = 
  // Etapas de configuração
  | "cadastro_jogadores" 
  | "selecao_modo" 
  | "configuracao_rodadas"
  // Etapas de jogo
  | "jogo" 
  | "desenho" 
  | "mimica" 
  | "adivinhacao" 
  | "resultado" 
  | "fim";

// Configurações do jogo
type ConfigJogo = {
  tempo: number;
  rodadas: number;
  categorias: string[];
  maxJogadores: number;
  modoRepresentacao: ModoRepresentacao;
  metaVitoria: number; // Quantidade de pontos necessários para vencer
};

export default function DesenhaEBebe() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [novoJogador, setNovoJogador] = useState("");
  // Iniciar com etapa de configuração para reorganizar o fluxo
  const [estadoJogo, setEstadoJogo] = useState<EstadoJogo>("cadastro_jogadores");
  const [config, setConfig] = useState<ConfigJogo>({
    tempo: 60,
    rodadas: 3,
    categorias: CATEGORIAS.map(c => c.id),
    maxJogadores: 8,
    modoRepresentacao: "desenho",
    metaVitoria: 5
  });
  
  // Registrar o jogo nas estatísticas do usuário quando a página for carregada
  useEffect(() => {
    const userId = localStorage.getItem('dev_session');
    if (userId) {
      startGameSession(userId, "Desenha e Bebe");
      updateGameStats(userId, "Desenha e Bebe");
    }
  }, []);
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [palavraAtual, setPalavraAtual] = useState("");
  const [categoriaAtual, setCategoriaAtual] = useState("");
  const [dificuldadeAtual, setDificuldadeAtual] = useState(1);
  const [tempo, setTempo] = useState(config.tempo);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [resultadoRodada, setResultadoRodada] = useState<"acerto" | "erro" | null>(null);
  const [palavrasUsadas, setPalavrasUsadas] = useState<string[]>([]);
  const [palavraDialogOpen, setPalavraDialogOpen] = useState(false);

  // Canvas para desenho
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [corPincel, setCorPincel] = useState("#000000");
  const [desenhoAtual, setDesenhoAtual] = useState<string | null>(null);
  const [tamanhoPincel, setTamanhoPincel] = useState(5);
  const [ultimaPosicao, setUltimaPosicao] = useState({ x: 0, y: 0 });

  // Timer para o tempo de desenho/adivinhação
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if ((estadoJogo === "desenho" || estadoJogo === "adivinhacao") && tempo > 0) {
      interval = setInterval(() => {
        setTempo(prevTempo => {
          if (prevTempo <= 1) {
            clearInterval(interval);
            if (estadoJogo === "desenho") {
              // Quando o tempo acabar no modo desenho, captura o desenho atual antes de mudar para adivinhação
              if (canvasRef.current && config.modoRepresentacao === "desenho") {
                // Salvar o desenho como uma URL de dados (data URL)
                const desenhoURL = canvasRef.current.toDataURL('image/png');
                setDesenhoAtual(desenhoURL);
              }
              
              setEstadoJogo("adivinhacao");
              setTempo(config.tempo);
            } else {
              handleResultado("erro");
            }
            return 0;
          }
          return prevTempo - 1;
        });
        setTempoDecorrido(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [estadoJogo, tempo, config.tempo, config.modoRepresentacao]);

  // Inicializar o contexto do canvas quando componente montar
  // Ajustar tamanho do canvas ao entrar no modo desenho
  useEffect(() => {
    if (canvasRef.current && estadoJogo === "desenho") {
      const canvas = canvasRef.current;
      
      // Ajustar tamanho do canvas para preencher o contêiner
      const container = canvas.parentElement;
      if (container) {
        // Definir tamanho baseado no contêiner com margem adequada
        canvas.width = Math.min(container.clientWidth - 20, 800);
        canvas.height = Math.min(window.innerHeight * 0.5, 500);
      }
      
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = corPincel;
        context.lineWidth = tamanhoPincel;
        setCtx(context);
        
        // Limpar o canvas
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [estadoJogo, corPincel, tamanhoPincel]);

  // Funções de desenho com correção de offset
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    setIsDrawing(true);
    
    e.preventDefault(); // Prevenir comportamento padrão
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // É um evento de toque
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // É um evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Corrigir coordenadas considerando a diferença entre as dimensões do canvas no DOM e suas dimensões internas
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setUltimaPosicao({ x, y });
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    e.preventDefault(); // Prevenir comportamento padrão
    
    let clientX, clientY;
    
    if ('touches' in e) {
      // É um evento de toque
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      // É um evento de mouse
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    
    // Corrigir coordenadas considerando a diferença entre as dimensões do canvas no DOM e suas dimensões internas
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    
    ctx.strokeStyle = corPincel;
    ctx.lineWidth = tamanhoPincel;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setUltimaPosicao({ x, y });
  };
  
  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  const limparCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Funções do jogo
  const adicionarJogador = () => {
    if (!novoJogador.trim()) return;
    
    if (jogadores.length >= config.maxJogadores) {
      toast({
        title: "Limite de jogadores atingido",
        description: `Máximo de ${config.maxJogadores} jogadores permitido`,
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
    
    // Registra o jogo nas estatísticas do usuário
    const userId = localStorage.getItem('dev_session');
    if (userId) {
      // Registrar o início da sessão de jogo
      startGameSession(userId, "Desenha e Bebe");
      // Atualizar as estatísticas do jogo (jogos recentes)
      updateGameStats(userId, "Desenha e Bebe");
    }
    
    setRodadaAtual(1);
    setJogadorAtual(0);
    selecionarPalavraCategoria();
    setEstadoJogo("jogo");
  };

  const selecionarPalavraCategoria = () => {
    // Filtra apenas as categorias selecionadas
    const categoriasFiltradas = CATEGORIAS.filter(cat => config.categorias.includes(cat.id));
    
    // Seleciona uma categoria aleatória
    const categoriaAleatoria = categoriasFiltradas[Math.floor(Math.random() * categoriasFiltradas.length)];
    setCategoriaAtual(categoriaAleatoria.id);
    setDificuldadeAtual(categoriaAleatoria.dificuldade);
    
    // Pega as palavras da categoria e filtra as já usadas
    const palavrasDisponiveis = PALAVRAS[categoriaAleatoria.id].filter(
      palavra => !palavrasUsadas.includes(palavra)
    );
    
    // Se não há palavras disponíveis, use todas as palavras dessa categoria
    const palavrasParaUsar = palavrasDisponiveis.length > 0 
      ? palavrasDisponiveis 
      : PALAVRAS[categoriaAleatoria.id];
    
    // Seleciona uma palavra aleatória
    const palavraAleatoria = palavrasParaUsar[Math.floor(Math.random() * palavrasParaUsar.length)];
    setPalavraAtual(palavraAleatoria);
    
    // Adiciona à lista de palavras usadas
    setPalavrasUsadas([...palavrasUsadas, palavraAleatoria]);
  };

  const iniciarAtividade = () => {
    setTempo(config.tempo);
    setTempoDecorrido(0);
    
    // Atualiza contador de vezes para o jogador atual
    const jogadoresAtualizados = [...jogadores];
    jogadoresAtualizados[jogadorAtual].vezes += 1;
    setJogadores(jogadoresAtualizados);
    
    // Direciona para o modo selecionado (desenho ou mímica)
    setEstadoJogo(config.modoRepresentacao);
  };
  
  const iniciarMimica = () => {
    setTempo(config.tempo);
    setEstadoJogo("adivinhacao");
  };

  const iniciarAdivinhacao = () => {
    // Capturar o desenho atual e salvá-lo antes de mudar de estado
    if (canvasRef.current && config.modoRepresentacao === "desenho") {
      // Salvar o desenho como uma URL de dados (data URL)
      const desenhoURL = canvasRef.current.toDataURL('image/png');
      setDesenhoAtual(desenhoURL);
    }
    
    setTempo(config.tempo);
    setEstadoJogo("adivinhacao");
  };

  const handleResultado = (resultado: "acerto" | "erro") => {
    setResultadoRodada(resultado);
    
    const jogadoresAtualizados = [...jogadores];
    
    if (resultado === "acerto") {
      // Jogador que desenhou/mimicou ganha 1 ponto
      jogadoresAtualizados[jogadorAtual].pontos += 1;
      jogadoresAtualizados[jogadorAtual].acertos += 1;
      
      toast({
        title: "Acerto!",
        description: `${jogadoresAtualizados[jogadorAtual].nome} ganhou 1 ponto!`,
        variant: "default",
      });
      
      // Verifica se o jogador atingiu a meta de pontos para vencer
      if (jogadoresAtualizados[jogadorAtual].pontos >= config.metaVitoria) {
        toast({
          title: "Meta atingida!",
          description: `${jogadoresAtualizados[jogadorAtual].nome} atingiu ${config.metaVitoria} pontos!`,
          variant: "default",
        });
      }
    } else {
      // Se errou, bebe conforme a dificuldade
      const nivelBebida = NIVEIS_BEBIDA.find(n => n.dificuldade === dificuldadeAtual) || NIVEIS_BEBIDA[0];
      jogadoresAtualizados[jogadorAtual].bebidas += dificuldadeAtual;
      
      toast({
        title: "Tempo esgotado!",
        description: `${jogadoresAtualizados[jogadorAtual].nome} deve beber: ${nivelBebida.quantidade}`,
        variant: "destructive",
      });
    }
    
    setJogadores(jogadoresAtualizados);
    setEstadoJogo("resultado");
  };

  const proximaRodada = () => {
    // Verifica se o jogador atual atingiu a meta de pontos
    if (jogadores[jogadorAtual].pontos >= config.metaVitoria) {
      setEstadoJogo("fim");
      return;
    }
    
    // Avança para o próximo jogador
    const novoJogadorAtual = (jogadorAtual + 1) % jogadores.length;
    setJogadorAtual(novoJogadorAtual);
    
    // Se voltou ao primeiro jogador, avança a rodada
    if (novoJogadorAtual === 0) {
      const novaRodada = rodadaAtual + 1;
      setRodadaAtual(novaRodada);
      
      // Verifica se o jogo acabou pelo número de rodadas
      if (novaRodada > config.rodadas) {
        setEstadoJogo("fim");
        return;
      }
    }
    
    // Seleciona nova palavra e categoria
    selecionarPalavraCategoria();
    setResultadoRodada(null);
    setEstadoJogo("jogo");
  };

  const reiniciarJogo = () => {
    setJogadores(jogadores.map(j => ({...j, pontos: 0, acertos: 0, vezes: 0, bebidas: 0})));
    setRodadaAtual(0);
    setJogadorAtual(0);
    setPalavrasUsadas([]);
    setEstadoJogo("cadastro_jogadores");
  };

  const voltarAoMenu = () => {
    navigate("/game-modes");
  };

  // Ordenar jogadores por pontos (para o ranking final)
  const jogadoresOrdenados = [...jogadores].sort((a, b) => b.pontos - a.pontos);

  // Renderização condicional baseada no estado do jogo
  const renderizarConteudo = () => {
    switch (estadoJogo) {
      case "cadastro_jogadores":
        return (
          <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">            
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
              <div className="flex items-center space-x-2">
                <Users2 className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">Cadastro de Jogadores</CardTitle>
              </div>
              <CardDescription className="text-purple-50">
                Passo 1 de 3 - Adicione quem vai participar da brincadeira
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex space-x-2">
                <Input
                  placeholder="Nome do jogador"
                  value={novoJogador}
                  onChange={(e) => setNovoJogador(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && adicionarJogador()}
                  maxLength={15}
                  className="border-purple-200 focus:border-purple-400"
                />
                <Button 
                  onClick={adicionarJogador}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  Adicionar
                </Button>
              </div>
              
              <div className="border border-purple-100 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-purple-800">Jogadores <span className="text-sm text-purple-600">({jogadores.length}/{config.maxJogadores})</span></h3>
                  {jogadores.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8 text-xs border-purple-200 text-purple-700"
                      onClick={() => setJogadores([])}
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Limpar
                    </Button>
                  )}
                </div>
                
                {jogadores.length === 0 ? (
                  <div className="text-center py-8 bg-purple-50 rounded-lg border border-dashed border-purple-200">
                    <UserPlus className="h-12 w-12 text-purple-300 mx-auto mb-2" />
                    <p className="text-purple-500">
                      Adicione pelo menos 2 jogadores para começar
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {jogadores.map((jogador, index) => (
                      <li 
                        key={jogador.id} 
                        className="flex justify-between items-center bg-purple-50 p-3 rounded-lg border border-purple-100 text-purple-900"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-200 h-8 w-8 rounded-full flex items-center justify-center font-bold text-purple-800">
                            {index + 1}
                          </div>
                          <span className="font-medium">{jogador.nome}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removerJogador(jogador.id)}
                          className="h-8 w-8 p-0 text-purple-700 hover:bg-purple-100 hover:text-purple-900"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <Alert className="bg-purple-50 border-purple-200">
                <AlertCircle className="h-4 w-4 text-purple-800" />
                <AlertTitle className="text-purple-900">Dica!</AlertTitle>
                <AlertDescription className="text-purple-700">
                  Adicione os nomes de todos que estarão participando. Você precisará de no mínimo 2 jogadores.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex justify-between p-6 bg-gray-50 border-t">
              <Button variant="outline" onClick={voltarAoMenu} className="border-purple-200 text-purple-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para o menu
              </Button>
              <Button 
                onClick={() => setEstadoJogo("selecao_modo")}
                disabled={jogadores.length < 2}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "selecao_modo":
        return (
          <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
              <div className="flex items-center space-x-2">
                <Palette className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">Modo de Jogo</CardTitle>
              </div>
              <CardDescription className="text-purple-50">
                Passo 2 de 3 - Escolha como você quer jogar
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-4">
                <div 
                  className={`cursor-pointer p-6 rounded-lg border-2 flex gap-4 items-center ${
                    config.modoRepresentacao === "desenho" 
                      ? "border-purple-600 bg-purple-50" 
                      : "border-gray-200 hover:bg-gray-50 hover:border-purple-300"
                  }`}
                  onClick={() => setConfig({...config, modoRepresentacao: "desenho"})}
                >
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Palette className="h-10 w-10 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900">Modo Desenho</h3>
                    <p className="text-gray-600">
                      O jogador recebe uma palavra e tem que desenhá-la para os outros adivinharem. Use cores, formas e sua criatividade!
                    </p>
                  </div>
                  {config.modoRepresentacao === "desenho" && (
                    <Check className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                
                <div 
                  className={`cursor-pointer p-6 rounded-lg border-2 flex gap-4 items-center ${
                    config.modoRepresentacao === "mimica" 
                      ? "border-purple-600 bg-purple-50" 
                      : "border-gray-200 hover:bg-gray-50 hover:border-purple-300"
                  }`}
                  onClick={() => setConfig({...config, modoRepresentacao: "mimica"})}
                >
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Drama className="h-10 w-10 text-purple-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-purple-900">Modo Mímica</h3>
                    <p className="text-gray-600">
                      O jogador recebe uma palavra e tem que representá-la usando apenas gestos. Nada de falar ou fazer sons!
                    </p>
                  </div>
                  {config.modoRepresentacao === "mimica" && (
                    <Check className="h-6 w-6 text-purple-600" />
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h3 className="font-medium text-purple-900 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Como funciona
                </h3>
                <p className="text-purple-700 text-sm">
                  No modo <strong>{config.modoRepresentacao === "desenho" ? "Desenho" : "Mímica"}</strong>, 
                  cada jogador terá sua vez de {config.modoRepresentacao === "desenho" ? "desenhar" : "fazer mímica"} para que os outros adivinhem.
                  Quem conseguir fazer os outros acertarem ganha pontos! Se ninguém acertar, o jogador bebe.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between p-6 bg-gray-50 border-t">
              <Button 
                variant="outline" 
                onClick={() => setEstadoJogo("cadastro_jogadores")}
                className="border-purple-200 text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button 
                onClick={() => setEstadoJogo("configuracao_rodadas")}
                className="bg-purple-700 hover:bg-purple-800"
              >
                Próximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "configuracao_rodadas":
        return (
          <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
              <div className="flex items-center space-x-2">
                <Settings2 className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">Configurações</CardTitle>
              </div>
              <CardDescription className="text-purple-50">
                Passo 3 de 3 - Defina as regras do jogo
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tempo" className="text-sm font-medium text-gray-700">Tempo por rodada</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg text-center">
                      <Timer className="h-8 w-8 text-purple-700 mx-auto mb-2" />
                      <span className="text-2xl font-bold text-purple-900">{config.tempo}</span>
                      <span className="text-xs text-purple-700 block">segundos</span>
                    </div>
                    <Slider
                      id="tempo"
                      min={30}
                      max={120}
                      step={15}
                      value={[config.tempo]}
                      onValueChange={(value) => setConfig({...config, tempo: value[0]})}
                      className="mt-4"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rodadas" className="text-sm font-medium text-gray-700">Número de rodadas</Label>
                    <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex items-center">
                      <Layers className="h-8 w-8 text-purple-700 mr-3" />
                      <div>
                        <input
                          type="number"
                          id="rodadas"
                          min={1}
                          max={10}
                          value={config.rodadas}
                          onChange={(e) => setConfig({...config, rodadas: parseInt(e.target.value) || 1})}
                          className="w-12 h-10 rounded border-purple-300 text-center text-lg font-bold text-purple-900"
                        />
                        <span className="text-xs text-purple-700 block mt-1">rodadas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="meta" className="text-sm font-medium text-gray-700">Pontos para vencer</Label>
                    <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex items-center">
                      <Trophy className="h-8 w-8 text-purple-700 mr-3" />
                      <div>
                        <input
                          type="number"
                          id="meta"
                          min={3}
                          max={15}
                          value={config.metaVitoria}
                          onChange={(e) => setConfig({...config, metaVitoria: parseInt(e.target.value) || 3})}
                          className="w-12 h-10 rounded border-purple-300 text-center text-lg font-bold text-purple-900"
                        />
                        <span className="text-xs text-purple-700 block mt-1">pontos</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Categorias de palavras</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CATEGORIAS.map((categoria) => (
                      <div 
                        key={categoria.id}
                        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer ${
                          config.categorias.includes(categoria.id) 
                            ? 'bg-purple-50 border-purple-300' 
                            : 'bg-white border-gray-200 hover:border-purple-200'
                        }`}
                        onClick={() => {
                          if (config.categorias.includes(categoria.id)) {
                            if (config.categorias.length > 1) {
                              setConfig({
                                ...config,
                                categorias: config.categorias.filter(c => c !== categoria.id)
                              });
                            } else {
                              toast({
                                title: "Pelo menos uma categoria é necessária",
                                variant: "destructive",
                              });
                            }
                          } else {
                            setConfig({
                              ...config,
                              categorias: [...config.categorias, categoria.id]
                            });
                          }
                        }}
                      >
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            id={`cat-${categoria.id}`}
                            checked={config.categorias.includes(categoria.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                        </div>
                        <Label htmlFor={`cat-${categoria.id}`} className="cursor-pointer flex-1">
                          <span className="font-medium text-purple-900 block">{categoria.nome}</span>
                          <span className="text-xs text-purple-700">
                            Dificuldade: {
                              categoria.dificuldade === 1 ? "Fácil" : 
                              categoria.dificuldade === 2 ? "Média" : "Difícil"
                            }
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <Alert className="bg-green-50 border-green-200">
                <PartyPopper className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Quase lá!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Todas as configurações estão prontas. Clique em "Iniciar Jogo" para começar a diversão!
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="flex justify-between p-6 bg-gray-50 border-t">
              <Button 
                variant="outline" 
                onClick={() => setEstadoJogo("selecao_modo")}
                className="border-purple-200 text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button 
                onClick={iniciarJogo}
                className="bg-green-600 hover:bg-green-700"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Iniciar Jogo
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "jogo":
        const categoriaObj = CATEGORIAS.find(c => c.id === categoriaAtual);
        
        return (
          <Card className="w-full max-w-xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-800 text-white text-sm font-medium mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Rodada {rodadaAtual}/{config.rodadas}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">
                    Vez de {jogadores[jogadorAtual]?.nome}
                  </CardTitle>
                </div>
                
                <Badge className="bg-purple-800 text-white border-0 hover:bg-purple-900 px-3 py-1 rounded-full">
                  {categoriaObj?.nome}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center p-8 bg-white rounded-lg border">
                <div className="mb-6">
                  <div className="bg-purple-100 p-4 rounded-lg border border-purple-300 mb-4">
                    <Avatar className="h-20 w-20 mx-auto mb-2">
                      <AvatarFallback className="bg-purple-600 text-white text-xl">
                        {jogadores[jogadorAtual]?.nome.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-black mb-1">{jogadores[jogadorAtual]?.nome}</h2>
                    <p className="text-sm text-black">é seu turno para {config.modoRepresentacao === "desenho" ? "desenhar" : "fazer mímica"}</p>
                  </div>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                      Apenas {jogadores[jogadorAtual]?.nome} deve ver a palavra secreta.
                      Os outros jogadores não devem olhar para a tela agora!
                    </AlertDescription>
                  </Alert>
                </div>
                
                <Button 
                  onClick={() => {
                    setPalavraDialogOpen(true);
                  }}
                  className="bg-purple-700 hover:bg-purple-800 w-full mb-4"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Revelar Minha Palavra
                </Button>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={iniciarAtividade}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {config.modoRepresentacao === "desenho" ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Estou Pronto Para Desenhar
                  </>
                ) : (
                  <>
                    <Drama className="mr-2 h-4 w-4" />
                    Estou Pronto Para Fazer Mímica
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "desenho":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {jogadores[jogadorAtual]?.nome} está desenhando...
                  </CardTitle>
                  <CardDescription>
                    Palavra: <span className="font-bold">[Secreta]</span>
                  </CardDescription>
                </div>
                
                <Badge variant="outline" className="text-lg font-bold">
                  <Clock className="mr-1 h-4 w-4" />
                  {tempo}s
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="relative bg-white border rounded-lg overflow-hidden">
                <div className="relative w-full flex justify-center">
                  <canvas
                    ref={canvasRef}
                    className="border-4 border-gray-300 bg-white rounded-lg shadow-lg w-full h-[500px] touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                
                <div className="absolute bottom-4 left-4 flex gap-2 bg-white/80 p-2 rounded-lg shadow">
                  <div className="flex gap-1">
                    {["#000000", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF"].map(cor => (
                      <button
                        key={cor}
                        className={`w-6 h-6 rounded-full border ${cor === corPincel ? 'ring-2 ring-offset-2 ring-black' : ''}`}
                        style={{ backgroundColor: cor }}
                        onClick={() => setCorPincel(cor)}
                      />
                    ))}
                  </div>
                  
                  <Separator orientation="vertical" />
                  
                  <div className="flex gap-1">
                    {[2, 5, 10, 15].map(tamanho => (
                      <button
                        key={tamanho}
                        className={`w-6 h-6 flex items-center justify-center rounded border ${tamanhoPincel === tamanho ? 'bg-gray-200' : ''}`}
                        onClick={() => setTamanhoPincel(tamanho)}
                      >
                        <div 
                          className="rounded-full bg-black" 
                          style={{ width: tamanho, height: tamanho }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-4 right-4 bg-white text-black font-medium shadow border-gray-300"
                  onClick={limparCanvas}
                >
                  Limpar
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm">
                  <Palette className="inline mr-1 h-4 w-4" />
                  Você está desenhando: <span className="font-bold">{palavraAtual}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Os outros jogadores devem tentar adivinhar!
                </p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={iniciarAdivinhacao} 
                className="w-full bg-purple-700 hover:bg-purple-800"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Finalizar desenho
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "mimica":
        return (
          <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-bold">
                    Pronto para iniciar? Toque em iniciar mímica!
                  </CardTitle>
                </div>
                
                <Badge variant="secondary" className="text-lg font-bold bg-white text-purple-800">
                  <Clock className="mr-1 h-4 w-4" />
                  {tempo}s
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <Drama className="h-32 w-32 text-purple-700 animate-pulse" />
                </div>
              </div>
              
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <p className="text-lg font-medium text-purple-900 mb-3 text-center">
                  Você está representando: <span className="font-bold text-purple-800 text-xl">{palavraAtual}</span>
                </p>
                <p className="text-gray-700 text-center mb-6">
                  Use apenas gestos! Não pode falar ou fazer sons!
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                    <Target className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Categoria</p>
                    <p className="font-bold text-purple-900">{CATEGORIAS.find(c => c.id === categoriaAtual)?.nome}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                    <Timer className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Tempo</p>
                    <p className="font-bold text-purple-900">{tempo} segundos</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Dificuldade</p>
                    <p className="font-bold text-purple-900">{dificuldadeAtual}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 bg-gray-50 border-t">
              <Button 
                onClick={iniciarAdivinhacao} 
                className="w-full bg-purple-700 hover:bg-purple-800 text-lg py-6"
              >
                <Drama className="mr-2 h-5 w-5" />
                Iniciar Mímica
              </Button>
            </CardFooter>
          </Card>
        );
      
      case "adivinhacao":
        return (
          <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="font-bold">Hora de adivinhar!</CardTitle>
                  <CardDescription className="text-white/90">
                    {config.modoRepresentacao === "desenho" 
                      ? `Desenho de ${jogadores[jogadorAtual]?.nome}`
                      : `Mímica de ${jogadores[jogadorAtual]?.nome}`
                    }
                  </CardDescription>
                </div>
                
                <Badge variant="secondary" className="text-lg font-bold bg-white text-purple-800">
                  <Clock className="mr-1 h-4 w-4" />
                  {tempo}s
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {config.modoRepresentacao === "desenho" && (
                <div className="bg-white border-4 border-gray-200 rounded-lg overflow-hidden shadow-lg flex justify-center">
                  {desenhoAtual ? (
                    // Mostrar a imagem capturada se disponível
                    <img 
                      src={desenhoAtual} 
                      alt="Desenho"
                      className="w-full h-[500px] object-contain" 
                    />
                  ) : (
                    // Manter o canvas como fallback
                    <canvas
                      ref={canvasRef}
                      className="w-full h-[500px]"
                    />
                  )}
                </div>
              )}
              
              {config.modoRepresentacao === "mimica" && (
                <div className="bg-white p-8 border rounded-lg shadow-sm text-center">
                  <div className="mb-6 flex justify-center">
                    <Drama className="h-24 w-24 text-purple-700 animate-pulse" />
                  </div>
                  <p className="text-lg font-medium text-gray-800 mb-3">
                    {jogadores[jogadorAtual]?.nome} está fazendo mímica!
                  </p>
                  <p className="text-gray-600">
                    Os outros jogadores devem adivinhar a palavra.
                  </p>
                </div>
              )}
              
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h3 className="font-medium text-center text-gray-800 mb-4">Os jogadores acertaram?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleResultado("acerto")} 
                    className="bg-green-600 hover:bg-green-700 py-6"
                  >
                    <Check className="mr-2 h-5 w-5" />
                    Sim! Acertou
                  </Button>
                  
                  <Button 
                    onClick={() => handleResultado("erro")} 
                    className="bg-amber-600 hover:bg-amber-700 py-6"
                  >
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Não acertou
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case "resultado":
        const nivelBebida = NIVEIS_BEBIDA.find(n => n.dificuldade === dificuldadeAtual) || NIVEIS_BEBIDA[0];
        
        return (
          <Card className="w-full max-w-xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className={`${
              resultadoRodada === "acerto" 
                ? "bg-gradient-to-r from-green-600 to-green-500" 
                : "bg-gradient-to-r from-amber-600 to-amber-500"
              } text-white`}
            >
              <div className="flex items-center justify-center gap-2">
                {resultadoRodada === "acerto" ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
                <CardTitle className="text-xl font-bold">
                  {resultadoRodada === "acerto" ? "Acertou!" : "Tempo Esgotado!"}
                </CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <div className={`text-center p-6 rounded-lg ${
                resultadoRodada === "acerto" 
                  ? "bg-green-50 border-green-200 border" 
                  : "bg-amber-50 border-amber-200 border"
              }`}>
                <p className="text-lg mb-3 text-gray-800">
                  A palavra era: <span className="font-bold text-purple-900">{palavraAtual}</span>
                </p>
                
                {resultadoRodada === "acerto" ? (
                  <div>
                    <div className="bg-green-100 p-4 rounded-full mx-auto h-24 w-24 flex items-center justify-center mb-4">
                      <Check className="h-14 w-14 text-green-600" />
                    </div>
                    <p className="text-gray-800 text-lg">
                      <span className="font-bold text-green-700">{jogadores[jogadorAtual]?.nome}</span> ganhou 1 ponto!
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="bg-amber-100 p-4 rounded-full mx-auto h-24 w-24 flex items-center justify-center mb-4">
                      <AlertTriangle className="h-14 w-14 text-amber-600" />
                    </div>
                    <p className="text-gray-800 text-lg">
                      <span className="font-bold text-amber-700">{jogadores[jogadorAtual]?.nome}</span> deve beber:
                    </p>
                    <div className="bg-white border border-amber-200 p-4 mt-3 rounded-lg inline-block shadow-sm">
                      <p className="text-amber-700 font-bold text-lg">{nivelBebida.quantidade}</p>
                      <p className="text-gray-600 text-sm">{nivelBebida.descricao}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-medium text-gray-800 text-center mb-3">Placar Atual</h3>
                <div className="space-y-3 pr-1">
                  {[...jogadores].sort((a, b) => b.pontos - a.pontos).map((jogador, index) => (
                    <div key={jogador.id} className="space-y-2">
                      <div className={`flex justify-between items-center p-3 rounded-lg ${
                        jogador.id === jogadores[jogadorAtual].id 
                          ? "bg-purple-50 border border-purple-200" 
                          : index === 0 
                            ? "bg-yellow-50 border border-yellow-200" 
                            : "bg-gray-50 border border-gray-200"
                      }`}>
                        <span className="font-medium text-gray-800">
                          {index + 1}. {jogador.nome}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-100">
                            <Trophy className="mr-1 h-3.5 w-3.5 text-purple-600" />
                            {jogador.pontos}
                          </Badge>
                          <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">
                            <HelpCircle className="mr-1 h-3.5 w-3.5 text-amber-600" />
                            {jogador.bebidas}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Trilha de progresso */}
                      <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden relative border">
                        <div 
                          className="h-full bg-purple-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                          style={{ width: `${Math.min(100, (jogador.pontos / config.metaVitoria) * 100)}%` }}
                        >
                          {jogador.pontos > 0 && (
                            <span className="text-white text-xs font-bold">
                              {Math.round((jogador.pontos / config.metaVitoria) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="absolute top-0 right-0 bottom-0 flex items-center pr-2">
                          <span className="text-xs text-gray-600 font-medium">
                            Meta: {config.metaVitoria}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 bg-gray-50 border-t">
              <Button 
                onClick={proximaRodada} 
                className="w-full bg-purple-700 hover:bg-purple-800"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Próxima Rodada
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "fim":
        const vencedor = jogadoresOrdenados[0];
        const empatados = jogadoresOrdenados.filter(j => j.pontos === vencedor.pontos);
        const temEmpate = empatados.length > 1;
        
        return (
          <Card className="w-full max-w-xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-6 w-6" />
                <CardTitle className="text-xl font-bold">
                  Fim de Jogo!
                </CardTitle>
              </div>
              <CardDescription className="text-center text-white">
                {config.rodadas} rodadas concluídas!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 p-6">
              <div className="text-center bg-white p-6 rounded-lg border shadow-sm">
                {temEmpate ? (
                  <div>
                    <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-400 p-2 rounded-full mb-4 shadow-lg">
                      <div className="bg-white p-4 rounded-full">
                        <Crown className="h-16 w-16 text-yellow-500" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-3 text-purple-900">Empate!</h2>
                    <div className="flex justify-center gap-2 flex-wrap mb-3">
                      {empatados.map((jogador) => (
                        <Badge key={jogador.id} className="bg-purple-100 text-purple-800 border border-purple-200 text-lg px-3 py-1">
                          {jogador.nome}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-600">
                      {empatados.length} jogadores empataram com {vencedor.pontos} pontos
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-400 p-2 rounded-full mb-4 shadow-lg">
                      <div className="bg-white p-4 rounded-full">
                        <Crown className="h-16 w-16 text-yellow-500" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-1 text-purple-900">{vencedor.nome}</h2>
                    <p className="text-gray-600 mb-4">Venceu com {vencedor.pontos} pontos!</p>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                        <p className="text-xs text-purple-700 font-medium">Pontos</p>
                        <p className="text-lg font-bold text-purple-900">{vencedor.pontos}</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                        <Check className="h-6 w-6 mx-auto mb-1 text-green-600" />
                        <p className="text-xs text-green-700 font-medium">Acertos</p>
                        <p className="text-lg font-bold text-green-900">{vencedor.acertos}</p>
                      </div>
                      
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                        <p className="text-xs text-amber-700 font-medium">Bebidas</p>
                        <p className="text-lg font-bold text-amber-900">{vencedor.bebidas}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-medium text-gray-800 text-center mb-3">Ranking Final</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {jogadoresOrdenados.map((jogador, index) => (
                    <div 
                      key={jogador.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 
                          ? "bg-yellow-50 border border-yellow-200" 
                          : "bg-white border border-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                          index === 0 ? "bg-yellow-500" :
                          index === 1 ? "bg-gray-400" :
                          index === 2 ? "bg-amber-700" : "bg-gray-300"
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{jogador.nome}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                          <Trophy className="h-4 w-4 text-purple-600" />
                          <span className="font-bold text-purple-900">{jogador.pontos}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-100">
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-900">{jogador.acertos}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-amber-900">{jogador.bebidas}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="font-medium text-gray-800 text-center mb-3">Estatísticas da Partida</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-600 font-medium">Tempo jogado</p>
                    <p className="text-xl font-bold text-gray-800">{Math.floor(tempoDecorrido / 60)} min</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border text-center">
                    <Layers className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs text-gray-600 font-medium">Total de rodadas</p>
                    <p className="text-xl font-bold text-gray-800">{config.rodadas}</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                    <Check className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">Mais acertos</p>
                    <p className="text-lg font-bold text-green-900">
                      {jogadores.reduce((prev, curr) => 
                        prev.acertos > curr.acertos ? prev : curr
                      ).nome}
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-amber-600" />
                    <p className="text-xs text-amber-700 font-medium">Mais bebidas</p>
                    <p className="text-lg font-bold text-amber-900">
                      {jogadores.reduce((prev, curr) => 
                        prev.bebidas > curr.bebidas ? prev : curr
                      ).nome}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 bg-gray-50 border-t flex gap-3">
              <Button 
                onClick={reiniciarJogo} 
                className="flex-1 bg-purple-700 hover:bg-purple-800"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Jogar Novamente
              </Button>
              
              <Button 
                variant="outline"
                onClick={voltarAoMenu} 
                className="flex-1 border-purple-200 text-purple-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Menu
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <GameLayout title="" showPlayers={false}>
      {/* Header com título estilo Apple */}
      <header className="text-center mb-6 pt-6">

        <div className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-2">
          <Palette className="h-4 w-4" />
          Desenha e Bebe
        </div>
        <p className="text-gray-500 max-w-md mx-auto">
          Desenhe, adivinhe e... quem falhar, bebe!
        </p>
      </header>
      
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
        {renderizarConteudo()}
      </div>
      
      {/* Dialog para mostrar a palavra secreta com estilo Apple */}
      <Dialog open={palavraDialogOpen} onOpenChange={setPalavraDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-none">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-800 to-purple-600">
              Sua palavra secreta
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Memorize a palavra e não mostre para os outros jogadores
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-white rounded-lg border text-center">
            <div className="text-4xl font-bold text-purple-800 mb-4 p-4 bg-purple-100 rounded-lg border border-purple-300">
              {palavraAtual}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Dificuldade: {dificuldadeAtual}/3 • Categoria: {CATEGORIAS.find(c => c.id === categoriaAtual)?.nome}
            </p>
            
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção!</AlertTitle>
              <AlertDescription>
                Memorize essa palavra e não mostre para os outros jogadores!
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button type="button" className="bg-purple-700 hover:bg-purple-800">
                Entendi e memorizei!
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}