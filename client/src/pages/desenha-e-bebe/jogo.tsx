import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { GameLayout } from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { 
  Check,
  Crown, 
  Clock, 
  Pencil, 
  HelpCircle, 
  Hourglass, 
  SkipForward,
  Trophy,
  PlayCircle,
  ArrowLeft,
  Palette,
  AlertTriangle,
  Eye,
  Drama
} from "lucide-react";
import { updateGameStats } from "@/lib/firebase";
import { shuffle } from "@/lib/utils";

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

// Estado do jogo
type EstadoJogo = "inicio" | "desenho" | "mimica" | "adivinhacao" | "resultado" | "fim";

// Configurações do jogo
type ConfigJogo = {
  tempo: number;
  rodadas: number;
  categorias: string[];
  maxJogadores: number;
  modoRepresentacao: ModoRepresentacao;
  metaVitoria: number;
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
  { dificuldade:.1, quantidade: "Gole pequeno", descricao: "Um gole rápido da sua bebida" },
  { dificuldade: 2, quantidade: "Gole médio", descricao: "Dois goles da sua bebida" },
  { dificuldade: 3, quantidade: "Gole grande", descricao: "Três goles da sua bebida ou um shot" },
];

export default function DesenhaEBebeJogo() {
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
  
  const [estadoJogo, setEstadoJogo] = useState<EstadoJogo>("inicio");
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [palavraAtual, setPalavraAtual] = useState("");
  const [categoriaAtual, setCategoriaAtual] = useState("");
  const [dificuldadeAtual, setDificuldadeAtual] = useState(1);
  const [tempo, setTempo] = useState(60);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [resultadoRodada, setResultadoRodada] = useState<"acerto" | "erro" | null>(null);
  const [palavrasUsadas, setPalavrasUsadas] = useState<string[]>([]);
  const [palavraDialogOpen, setPalavraDialogOpen] = useState(false);
  const [vencedor, setVencedor] = useState<Jogador | null>(null);

  // Canvas para desenho
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [corPincel, setCorPincel] = useState("#000000");
  const [desenhoAtual, setDesenhoAtual] = useState<string | null>(null);
  const [tamanhoPincel, setTamanhoPincel] = useState(5);
  const [ultimaPosicao, setUltimaPosicao] = useState({ x: 0, y: 0 });

  // Carregar jogadores e configurações do localStorage
  useEffect(() => {
    const jogadoresSalvos = localStorage.getItem('desenhaEBebeJogadores');
    const configSalva = localStorage.getItem('desenhaEBebeConfig');
    
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
            description: "Adicione pelo menos 2 jogadores para jogar",
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
    
    if (configSalva) {
      try {
        const parsed = JSON.parse(configSalva);
        setConfig(parsed);
        setTempo(parsed.tempo);
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  }, [navigate, toast]);

  // Timer para o tempo de desenho/adivinhação
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if ((estadoJogo === "desenho" || estadoJogo === "mimica" || estadoJogo === "adivinhacao") && tempo > 0) {
      interval = setInterval(() => {
        setTempo(prevTempo => {
          if (prevTempo <= 1) {
            clearInterval(interval);
            if (estadoJogo === "desenho" || estadoJogo === "mimica") {
              // Quando o tempo acabar no modo desenho/mímica, captura o desenho atual antes de mudar para adivinhação
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

  const iniciarRodada = () => {
    setRodadaAtual(prev => prev + 1);
    selecionarPalavraCategoria();
    setPalavraDialogOpen(true);
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
        setVencedor(jogadoresAtualizados[jogadorAtual]);
        setEstadoJogo("fim");
        
        // Atualizar estatísticas
        const userId = localStorage.getItem('dev_session');
        if (userId) {
          updateGameStats(userId, "Desenha e Bebe");
        }
        
        return;
      }
    } else {
      // Em caso de erro, o jogador bebe de acordo com a dificuldade
      jogadoresAtualizados[jogadorAtual].bebidas += dificuldadeAtual;
      
      toast({
        title: "Erro!",
        description: `${jogadoresAtualizados[jogadorAtual].nome} deve beber!`,
        variant: "destructive",
      });
    }
    
    setJogadores(jogadoresAtualizados);
    setEstadoJogo("resultado");
  };

  const proximoJogador = () => {
    // Passa para o próximo jogador
    let proximoIndex = (jogadorAtual + 1) % jogadores.length;
    setJogadorAtual(proximoIndex);
    
    // Resetar estados para a próxima rodada
    setResultadoRodada(null);
    setDesenhoAtual(null);
    setTempo(config.tempo);
    setTempoDecorrido(0);
    
    // Voltar para o início
    setEstadoJogo("inicio");
  };

  const reiniciarJogo = () => {
    // Resetar todos os estados para começar um novo jogo
    setRodadaAtual(0);
    setJogadorAtual(0);
    setPalavrasUsadas([]);
    setVencedor(null);
    
    // Resetar pontuações dos jogadores
    const jogadoresResetados = jogadores.map(j => ({
      ...j,
      pontos: 0,
      acertos: 0,
      vezes: 0,
      bebidas: 0
    }));
    
    setJogadores(jogadoresResetados);
    localStorage.setItem('desenhaEBebeJogadores', JSON.stringify(jogadoresResetados));
    
    // Voltar para o início
    setEstadoJogo("inicio");
  };

  const voltarParaConfiguracoes = () => {
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

  // Renderização dos diferentes estados do jogo
  const renderJogo = () => {
    switch (estadoJogo) {
      case "inicio":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">Rodada {rodadaAtual + 1}</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Vez de:</h3>
                <div className="flex flex-col items-center justify-center p-4">
                  <Avatar className={`${coresAvatar[jogadorAtual % coresAvatar.length]} h-20 w-20 mb-2`}>
                    <AvatarFallback className="text-3xl text-white">
                      {getInitials(jogadores[jogadorAtual]?.nome || "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xl font-bold text-purple-900">{jogadores[jogadorAtual]?.nome}</span>
                  
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" /> {jogadores[jogadorAtual]?.pontos} pontos
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={iniciarRodada}
                  className="bg-purple-700 hover:bg-purple-800"
                  size="lg"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Iniciar Rodada
                </Button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3 text-center">Placar</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {shuffle([...jogadores])
                    .sort((a, b) => b.pontos - a.pontos)
                    .map((jogador, index) => (
                      <div key={jogador.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 min-w-5">{index + 1}.</span>
                          <Avatar className={`${coresAvatar[jogadores.findIndex(j => j.id === jogador.id) % coresAvatar.length]} h-7 w-7`}>
                            <AvatarFallback className="text-xs text-white">
                              {getInitials(jogador.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{jogador.nome}</span>
                        </div>
                        <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-800">
                          {jogador.pontos} pts
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "desenho":
        return (
          <Card className="w-full max-w-5xl">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="border-white text-white">
                  <Clock className="w-3 h-3 mr-1" /> {tempo}s
                </Badge>
                <CardTitle className="text-xl">Desenhe: {jogadores[jogadorAtual]?.nome}</CardTitle>
                <Badge variant="secondary" className="bg-white text-purple-900">
                  <Pencil className="w-3 h-3 mr-1" /> Desenho
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {["#000000", "#e53e3e", "#3182ce", "#38a169", "#d69e2e", "#805ad5", "#dd6b20", "#718096"].map(cor => (
                  <button
                    key={cor}
                    onClick={() => setCorPincel(cor)}
                    className={`w-8 h-8 rounded-full ${corPincel === cor ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                    style={{ backgroundColor: cor }}
                    aria-label={`Cor ${cor}`}
                  />
                ))}
                
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setTamanhoPincel(3)}
                    className={`flex items-center justify-center w-8 h-8 border rounded-full ${tamanhoPincel === 3 ? 'bg-purple-100 border-purple-500' : 'border-gray-300'}`}
                  >
                    <div className="w-1 h-1 rounded-full bg-black" />
                  </button>
                  <button
                    onClick={() => setTamanhoPincel(5)}
                    className={`flex items-center justify-center w-8 h-8 border rounded-full ${tamanhoPincel === 5 ? 'bg-purple-100 border-purple-500' : 'border-gray-300'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </button>
                  <button
                    onClick={() => setTamanhoPincel(10)}
                    className={`flex items-center justify-center w-8 h-8 border rounded-full ${tamanhoPincel === 10 ? 'bg-purple-100 border-purple-500' : 'border-gray-300'}`}
                  >
                    <div className="w-3 h-3 rounded-full bg-black" />
                  </button>
                  <button
                    onClick={limparCanvas}
                    className="ml-2 p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    aria-label="Limpar canvas"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full touch-none"
                  style={{ backgroundColor: 'white' }}
                />
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEstadoJogo("resultado");
                    setResultadoRodada("erro");
                    const jogadoresAtualizados = [...jogadores];
                    jogadoresAtualizados[jogadorAtual].bebidas += dificuldadeAtual;
                    setJogadores(jogadoresAtualizados);
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Desistir
                </Button>
                
                <Button
                  onClick={iniciarAdivinhacao}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Pronto para Adivinhação
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "mimica":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="border-white text-white">
                  <Clock className="w-3 h-3 mr-1" /> {tempo}s
                </Badge>
                <CardTitle className="text-xl">Mímica: {jogadores[jogadorAtual]?.nome}</CardTitle>
                <Badge variant="secondary" className="bg-white text-purple-900">
                  <Drama className="w-3 h-3 mr-1" /> Mímica
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="p-4 bg-purple-100 rounded-xl border border-purple-200">
                  <h3 className="font-bold text-xl text-purple-900 mb-2">Palavra secreta:</h3>
                  <div className="font-bold text-3xl text-purple-800 py-3">
                    {palavraAtual}
                  </div>
                  <p className="text-sm text-purple-700">
                    Categoria: {CATEGORIAS.find(c => c.id === categoriaAtual)?.nome} • Dificuldade: {dificuldadeAtual}/3
                  </p>
                </div>
                
                <Alert className="mt-4 border-amber-300 bg-amber-50 text-amber-800">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Lembrete!</AlertTitle>
                  <AlertDescription>
                    Faça mímica e gestos. Não pode falar, nem emitir sons, nem escrever!
                  </AlertDescription>
                </Alert>
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEstadoJogo("resultado");
                    setResultadoRodada("erro");
                    const jogadoresAtualizados = [...jogadores];
                    jogadoresAtualizados[jogadorAtual].bebidas += dificuldadeAtual;
                    setJogadores(jogadoresAtualizados);
                  }}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <SkipForward className="mr-2 h-4 w-4" />
                  Desistir
                </Button>
                
                <Button
                  onClick={() => setEstadoJogo("adivinhacao")}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Pronto para Adivinhação
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "adivinhacao":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-purple-900 text-white rounded-t-lg">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="border-white text-white">
                  <Clock className="w-3 h-3 mr-1" /> {tempo}s
                </Badge>
                <CardTitle className="text-xl">Adivinhem a palavra!</CardTitle>
                <Badge variant="secondary" className="bg-white text-purple-900">
                  <HelpCircle className="w-3 h-3 mr-1" /> Adivinhação
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {config.modoRepresentacao === "desenho" && desenhoAtual && (
                <div className="text-center mb-4">
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src={desenhoAtual} 
                      alt="Desenho da palavra secreta" 
                      className="max-w-full max-h-[400px] mx-auto"
                    />
                  </div>
                </div>
              )}
              
              {config.modoRepresentacao === "mimica" && (
                <div className="text-center mb-4">
                  <div className="bg-purple-100 rounded-lg p-6 flex items-center justify-center">
                    <Drama className="h-20 w-20 text-purple-700" />
                  </div>
                  <p className="mt-2 text-purple-700">Continuar a mímica para adivinhação!</p>
                </div>
              )}
              
              <div className="flex flex-col gap-3">
                <div className="text-center py-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {jogadores[jogadorAtual]?.nome} está {config.modoRepresentacao === "desenho" ? "desenhando" : "mimicando"}...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Todos os outros jogadores devem tentar adivinhar a palavra!
                  </p>
                </div>
                
                <div className="flex justify-center gap-3 mt-4">
                  <Button
                    onClick={() => handleResultado("erro")}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Ninguém acertou
                  </Button>
                  
                  <Button
                    onClick={() => handleResultado("acerto")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Acertaram!
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case "resultado":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader className={`${resultadoRodada === "acerto" ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-red-600 to-red-700"} text-white rounded-t-lg`}>
              <CardTitle className="text-2xl font-bold text-center">
                {resultadoRodada === "acerto" ? "Acertou!" : "Tempo esgotado!"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <p className="text-lg">A palavra era:</p>
                  <div className="font-bold text-3xl text-purple-900 my-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    {palavraAtual}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Categoria: <span className="font-medium">{CATEGORIAS.find(c => c.id === categoriaAtual)?.nome}</span> • 
                    Dificuldade: <span className="font-medium">{dificuldadeAtual}/3</span>
                  </p>
                </div>
                
                {resultadoRodada === "acerto" ? (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                    <p className="font-medium text-green-800 mb-2">
                      <Check className="inline mr-2 h-4 w-4" />
                      {jogadores[jogadorAtual]?.nome} ganhou 1 ponto!
                    </p>
                    
                    <p className="text-green-700">
                      Agora tem {jogadores[jogadorAtual]?.pontos} pontos de {config.metaVitoria} necessários para vencer.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <p className="font-medium text-red-800 mb-2">
                      <AlertTriangle className="inline mr-2 h-4 w-4" />
                      {jogadores[jogadorAtual]?.nome} deve beber:
                    </p>
                    
                    <p className="text-lg font-bold text-red-700">
                      {NIVEIS_BEBIDA.find(n => n.dificuldade === dificuldadeAtual)?.quantidade || "Gole médio"}
                    </p>
                    
                    <p className="text-sm text-red-600 mt-1">
                      {NIVEIS_BEBIDA.find(n => n.dificuldade === dificuldadeAtual)?.descricao || "Dois goles da sua bebida"}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center pt-4">
                <Button
                  onClick={proximoJogador}
                  className="bg-purple-700 hover:bg-purple-800"
                  size="lg"
                >
                  Próximo Jogador
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        
      case "fim":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">Temos um Vencedor!</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col items-center justify-center">
                <Crown className="h-16 w-16 text-amber-500 mb-2" />
                
                <Avatar className="h-24 w-24 mb-3 border-4 border-amber-300">
                  <AvatarFallback className={`${coresAvatar[jogadores.findIndex(j => j.id === vencedor?.id) % coresAvatar.length]} text-3xl text-white`}>
                    {getInitials(vencedor?.nome || "")}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{vencedor?.nome}</h2>
                <p className="text-amber-600 font-medium mb-6">Venceu com {vencedor?.pontos} pontos!</p>
                
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-purple-700">Desenhos/Mímicas</p>
                    <p className="text-xl font-bold text-purple-900">{vencedor?.vezes || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-green-700">Acertos</p>
                    <p className="text-xl font-bold text-green-900">{vencedor?.acertos || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3 text-center">Placar Final</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {shuffle([...jogadores])
                    .sort((a, b) => b.pontos - a.pontos)
                    .map((jogador, index) => (
                      <div 
                        key={jogador.id} 
                        className={`flex items-center justify-between p-2 rounded-lg ${jogador.id === vencedor?.id ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 min-w-5">{index + 1}.</span>
                          <Avatar className={`${coresAvatar[jogadores.findIndex(j => j.id === jogador.id) % coresAvatar.length]} h-7 w-7`}>
                            <AvatarFallback className="text-xs text-white">
                              {getInitials(jogador.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{jogador.nome}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-800">
                            {jogador.pontos} pts
                          </Badge>
                          {jogador.id === vencedor?.id && (
                            <Crown className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={voltarParaConfiguracoes}
                  className="border-purple-200 text-purple-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Alterar Configurações
                </Button>
                
                <Button
                  onClick={reiniciarJogo}
                  className="bg-purple-700 hover:bg-purple-800"
                >
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Jogar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <GameLayout title="Desenha e Bebe" showPlayers={false}>
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        {renderJogo()}
      </div>
      
      {/* Dialog para mostrar a palavra secreta */}
      <Dialog open={palavraDialogOpen} onOpenChange={setPalavraDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Sua palavra secreta</DialogTitle>
            <DialogDescription className="text-center">
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
              <Button type="button" onClick={iniciarAtividade} className="bg-purple-700 hover:bg-purple-800">
                Entendi e memorizei!
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}