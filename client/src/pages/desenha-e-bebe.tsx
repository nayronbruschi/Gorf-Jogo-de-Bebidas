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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { shuffle } from "@/lib/utils";
import { GameLayout } from "@/components/GameLayout";
import { 
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
  Palette,
  AlertTriangle,
  Drama,
  Target,
  Timer
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
type EstadoJogo = "configuracao" | "jogo" | "desenho" | "mimica" | "adivinhacao" | "resultado" | "fim";

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
  const [estadoJogo, setEstadoJogo] = useState<EstadoJogo>("configuracao");
  const [config, setConfig] = useState<ConfigJogo>({
    tempo: 60,
    rodadas: 3,
    categorias: CATEGORIAS.map(c => c.id),
    maxJogadores: 8,
    modoRepresentacao: "desenho",
    metaVitoria: 5
  });
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [jogadorAtual, setJogadorAtual] = useState(0);
  const [palavraAtual, setPalavraAtual] = useState("");
  const [categoriaAtual, setCategoriaAtual] = useState("");
  const [dificuldadeAtual, setDificuldadeAtual] = useState(1);
  const [tempo, setTempo] = useState(config.tempo);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [resultadoRodada, setResultadoRodada] = useState<"acerto" | "erro" | null>(null);
  const [palavrasUsadas, setPalavrasUsadas] = useState<string[]>([]);

  // Canvas para desenho
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [corPincel, setCorPincel] = useState("#000000");
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
  }, [estadoJogo, tempo, config.tempo]);

  // Inicializar o contexto do canvas quando componente montar
  useEffect(() => {
    if (canvasRef.current && estadoJogo === "desenho") {
      const canvas = canvasRef.current;
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

  // Funções de desenho
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    setIsDrawing(true);
    
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setUltimaPosicao({ x, y });
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
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
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
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
    setEstadoJogo("configuracao");
  };

  const voltarAoMenu = () => {
    navigate("/game-modes");
  };

  // Ordenar jogadores por pontos (para o ranking final)
  const jogadoresOrdenados = [...jogadores].sort((a, b) => b.pontos - a.pontos);

  // Renderização condicional baseada no estado do jogo
  const renderizarConteudo = () => {
    switch (estadoJogo) {
      case "configuracao":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Desenha e Bebe</CardTitle>
              <CardDescription className="text-center">
                Desenhe, adivinhe e... quem falhar, bebe!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Tabs defaultValue="jogadores">
                <TabsList className="w-full">
                  <TabsTrigger value="jogadores" className="flex-1">Jogadores</TabsTrigger>
                  <TabsTrigger value="configuracoes" className="flex-1">Configurações</TabsTrigger>
                  <TabsTrigger value="regras" className="flex-1">Regras</TabsTrigger>
                </TabsList>
                
                <TabsContent value="jogadores" className="space-y-4 mt-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nome do jogador"
                      value={novoJogador}
                      onChange={(e) => setNovoJogador(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && adicionarJogador()}
                      maxLength={15}
                    />
                    <Button onClick={adicionarJogador}>Adicionar</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Jogadores ({jogadores.length}/{config.maxJogadores})</h3>
                    {jogadores.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        Adicione jogadores para começar
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {jogadores.map((jogador) => (
                          <li key={jogador.id} className="flex justify-between items-center bg-muted p-2 rounded">
                            <span>{jogador.nome}</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removerJogador(jogador.id)}
                              className="h-8 w-8 p-0"
                            >
                              &times;
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="configuracoes" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempo">Tempo por rodada: {config.tempo} segundos</Label>
                      <Slider
                        id="tempo"
                        min={30}
                        max={120}
                        step={15}
                        value={[config.tempo]}
                        onValueChange={(value) => setConfig({...config, tempo: value[0]})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rodadas">Número de rodadas: {config.rodadas}</Label>
                      <Slider
                        id="rodadas"
                        min={1}
                        max={10}
                        step={1}
                        value={[config.rodadas]}
                        onValueChange={(value) => setConfig({...config, rodadas: value[0]})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta">Pontos para vencer: {config.metaVitoria}</Label>
                      <Slider
                        id="meta"
                        min={3}
                        max={15}
                        step={1}
                        value={[config.metaVitoria]}
                        onValueChange={(value) => setConfig({...config, metaVitoria: value[0]})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Modo de representação</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className={`cursor-pointer p-4 rounded-lg border-2 flex flex-col items-center ${
                            config.modoRepresentacao === "desenho" 
                              ? "border-purple-600 bg-purple-50" 
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          onClick={() => setConfig({...config, modoRepresentacao: "desenho"})}
                        >
                          <Palette className="h-8 w-8 mb-2 text-purple-700" />
                          <span className="font-medium">Desenho</span>
                          <span className="text-xs text-gray-500 text-center mt-1">
                            Desenhe a palavra para os outros adivinharem
                          </span>
                        </div>
                        
                        <div 
                          className={`cursor-pointer p-4 rounded-lg border-2 flex flex-col items-center ${
                            config.modoRepresentacao === "mimica" 
                              ? "border-purple-600 bg-purple-50" 
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          onClick={() => setConfig({...config, modoRepresentacao: "mimica"})}
                        >
                          <Drama className="h-8 w-8 mb-2 text-purple-700" />
                          <span className="font-medium">Mímica</span>
                          <span className="text-xs text-gray-500 text-center mt-1">
                            Faça mímicas para representar a palavra
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Categorias</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORIAS.map((categoria) => (
                          <div key={categoria.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`cat-${categoria.id}`}
                              checked={config.categorias.includes(categoria.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setConfig({
                                    ...config,
                                    categorias: [...config.categorias, categoria.id]
                                  });
                                } else {
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
                                }
                              }}
                            />
                            <Label htmlFor={`cat-${categoria.id}`} className="cursor-pointer">
                              {categoria.nome}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="regras" className="space-y-4 mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">Como jogar:</h3>
                    <ol className="list-decimal pl-5 space-y-3 text-gray-800">
                      <li className="bg-purple-50 p-2 rounded">
                        Um jogador recebe uma palavra para {config.modoRepresentacao === "desenho" ? "desenhar" : "fazer mímica"}.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        O jogador tem <span className="font-bold text-purple-700">{config.tempo} segundos</span> para 
                        {config.modoRepresentacao === "desenho" 
                          ? " desenhar a palavra" 
                          : " representar a palavra usando apenas gestos (sem falar ou emitir sons)"
                        }.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        Os outros jogadores têm <span className="font-bold text-purple-700">{config.tempo} segundos</span> para adivinhar.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        Se os jogadores adivinharem, o {config.modoRepresentacao === "desenho" ? "desenhista" : "mímico"} ganha <span className="font-bold text-green-600">1 ponto</span>.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        Se ninguém adivinhar, o jogador <span className="font-bold text-red-600">bebe</span> conforme a dificuldade da palavra.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        A cada rodada, um novo jogador {config.modoRepresentacao === "desenho" ? "desenha" : "faz mímica"}.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        O primeiro jogador a atingir <span className="font-bold text-purple-700">{config.metaVitoria} pontos</span> vence o jogo.
                      </li>
                      <li className="bg-purple-50 p-2 rounded">
                        Se nenhum jogador atingir a meta, o jogo acaba após <span className="font-bold text-purple-700">{config.rodadas} rodadas</span> completas,
                        e vence quem tiver mais pontos.
                      </li>
                    </ol>
                    
                    <h3 className="text-lg font-bold text-purple-800 mt-6 mb-3">Níveis de bebida:</h3>
                    <div className="grid gap-3">
                      {NIVEIS_BEBIDA.map((nivel) => (
                        <div key={nivel.dificuldade} className={`p-3 rounded-lg border ${
                          nivel.dificuldade === 1 ? 'bg-green-50 border-green-200' :
                          nivel.dificuldade === 2 ? 'bg-yellow-50 border-yellow-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="font-bold mb-1 flex items-center">
                            <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
                              nivel.dificuldade === 1 ? 'bg-green-500' :
                              nivel.dificuldade === 2 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></span>
                            Dificuldade {nivel.dificuldade}: {nivel.quantidade}
                          </div>
                          <p className="text-gray-700 text-sm">{nivel.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={voltarAoMenu}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button 
                onClick={iniciarJogo}
                disabled={jogadores.length < 2}
                className="bg-purple-700 hover:bg-purple-800"
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
          <Card className="w-full max-w-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold">Rodada {rodadaAtual}/{config.rodadas}</CardTitle>
                  <CardDescription>
                    Vez de: <span className="font-bold">{jogadores[jogadorAtual]?.nome}</span>
                  </CardDescription>
                </div>
                
                <Badge className={`${categoriaObj?.cor} text-white`}>
                  {categoriaObj?.nome}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center p-8 bg-white rounded-lg border">
                <h2 className="text-2xl font-bold mb-2 text-black">Sua palavra é:</h2>
                <div className="text-4xl font-bold text-black mb-4">
                  {palavraAtual}
                </div>
                
                <p className="text-sm text-black">
                  Dificuldade: {dificuldadeAtual}/3
                </p>
                
                <div className="my-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção!</AlertTitle>
                    <AlertDescription>
                      Não mostre essa tela aos outros jogadores!
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={iniciarAtividade}
                className="w-full bg-purple-700 hover:bg-purple-800"
              >
                {config.modoRepresentacao === "desenho" ? (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Começar a Desenhar
                  </>
                ) : (
                  <>
                    <Drama className="mr-2 h-4 w-4" />
                    Começar a Mímica
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
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="w-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
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
                className="w-full"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Pronto! Hora de adivinhar
              </Button>
            </CardFooter>
          </Card>
        );
        
      case "mimica":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {jogadores[jogadorAtual]?.nome} está fazendo mímica...
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
              <div className="bg-white p-8 border rounded-lg text-center">
                <div className="mb-6 flex justify-center">
                  <Drama className="h-32 w-32 text-purple-700 animate-pulse" />
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-base text-black">
                    <Drama className="inline mr-1 h-4 w-4" />
                    Você está representando: <span className="font-bold text-black text-lg">{palavraAtual}</span>
                  </p>
                  <p className="text-sm text-black mt-1">
                    Use apenas gestos! Não pode falar ou fazer sons!
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-sm mt-8">
                  <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">
                    <Target className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="font-medium text-black">Categoria</p>
                    <p className="font-bold text-black">{CATEGORIAS.find(c => c.id === categoriaAtual)?.nome}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">
                    <Timer className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="font-medium text-black">Tempo</p>
                    <p className="font-bold text-black">{tempo} segundos</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border shadow-sm">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <p className="font-medium text-black">Dificuldade</p>
                    <p className="font-bold text-black">{dificuldadeAtual}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={iniciarAdivinhacao} 
                className="w-full bg-purple-700 hover:bg-purple-800"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Pronto! Hora de adivinhar
              </Button>
            </CardContent>
          </Card>
        );
      
      case "adivinhacao":
        return (
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Hora de adivinhar!</CardTitle>
                  <CardDescription>
                    {config.modoRepresentacao === "desenho" 
                      ? `Desenho de ${jogadores[jogadorAtual]?.nome}`
                      : `Mímica de ${jogadores[jogadorAtual]?.nome}`
                    }
                  </CardDescription>
                </div>
                
                <Badge variant="outline" className="text-lg font-bold">
                  <Clock className="mr-1 h-4 w-4" />
                  {tempo}s
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {config.modoRepresentacao === "desenho" && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="w-full"
                  />
                </div>
              )}
              
              {config.modoRepresentacao === "mimica" && (
                <div className="bg-white p-8 border rounded-lg text-center">
                  <div className="mb-4 flex justify-center">
                    <Drama className="h-20 w-20 text-purple-700" />
                  </div>
                  <p className="text-lg font-medium text-black mb-2">
                    {jogadores[jogadorAtual]?.nome} está fazendo mímica!
                  </p>
                  <p className="text-sm text-black">
                    Os outros jogadores devem adivinhar a palavra.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="font-medium">Os jogadores acertaram?</h3>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleResultado("acerto")} 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Sim! Alguém acertou
                  </Button>
                  
                  <Button 
                    onClick={() => handleResultado("erro")} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <SkipForward className="mr-2 h-4 w-4" />
                    Não, ninguém acertou
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
        
      case "resultado":
        const nivelBebida = NIVEIS_BEBIDA.find(n => n.dificuldade === dificuldadeAtual) || NIVEIS_BEBIDA[0];
        
        return (
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-center">
                {resultadoRodada === "acerto" ? "Acertou!" : "Tempo Esgotado!"}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className={`text-center p-6 rounded-lg ${
                resultadoRodada === "acerto" 
                  ? "bg-green-100 border-green-500 border" 
                  : "bg-red-100 border-red-500 border"
              }`}>
                <p className="text-lg mb-2">
                  A palavra era: <span className="font-bold">{palavraAtual}</span>
                </p>
                
                {resultadoRodada === "acerto" ? (
                  <div>
                    <Check className="mx-auto h-12 w-12 text-green-600 mb-2" />
                    <p className="text-green-700">
                      <span className="font-bold">{jogadores[jogadorAtual]?.nome}</span> ganhou 1 ponto!
                    </p>
                  </div>
                ) : (
                  <div>
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-2" />
                    <p className="text-red-700">
                      <span className="font-bold">{jogadores[jogadorAtual]?.nome}</span> deve beber:
                    </p>
                    <p className="text-xl font-bold mt-2 text-red-800">
                      {nivelBebida.quantidade}
                    </p>
                    <p className="text-sm mt-1 text-red-700">
                      {nivelBebida.descricao}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2 text-black">Placar atual:</h3>
                <div className="space-y-4">
                  {[...jogadores].sort((a, b) => b.pontos - a.pontos).map((jogador) => (
                    <div key={jogador.id} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-black">{jogador.nome}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600 text-white font-medium">
                            <Trophy className="mr-1 h-3 w-3" />
                            {jogador.pontos}
                          </Badge>
                          <Badge className="bg-red-600 text-white font-medium">
                            <HelpCircle className="mr-1 h-3 w-3" />
                            {jogador.bebidas}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Trilha de progresso */}
                      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-purple-700 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-1"
                          style={{ width: `${Math.min(100, (jogador.pontos / config.metaVitoria) * 100)}%` }}
                        >
                          {jogador.pontos > 0 && (
                            <span className="text-white text-xs font-bold">
                              {Math.round((jogador.pontos / config.metaVitoria) * 100)}%
                            </span>
                          )}
                        </div>
                        <div className="absolute top-0 right-0 bottom-0 flex items-center pr-2">
                          <span className="text-xs text-black font-medium">
                            Meta: {config.metaVitoria}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={proximaRodada} 
                className="w-full bg-purple-700 hover:bg-purple-800"
              >
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
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Fim de Jogo!
              </CardTitle>
              <CardDescription className="text-center">
                {config.rodadas} rodadas completadas
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                {temEmpate ? (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Empate!</h2>
                    <div className="flex justify-center gap-2 flex-wrap mb-2">
                      {empatados.map((jogador) => (
                        <Badge key={jogador.id} className="bg-purple-600 text-white text-lg px-3 py-1">
                          {jogador.nome}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm">
                      {empatados.length} jogadores empataram com {vencedor.pontos} pontos
                    </p>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold mb-2">Vencedor</h2>
                    <Badge className="bg-purple-600 text-white text-xl px-4 py-2 mb-2">
                      <Crown className="mr-2 h-5 w-5" />
                      {vencedor.nome}
                    </Badge>
                    <p className="text-sm">com {vencedor.pontos} pontos</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-bold mb-3 text-center text-black">Placar Final</h3>
                <div className="space-y-3">
                  {jogadoresOrdenados.map((jogador, index) => (
                    <div 
                      key={jogador.id} 
                      className={`flex justify-between items-center p-2 rounded ${
                        index === 0 && !temEmpate ? 'bg-purple-100 border border-purple-300' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-6 text-center text-black">#{index+1}</span>
                        <span className="font-medium text-black">{jogador.nome}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-black">Pontos</span>
                          <Badge className="bg-green-600 text-white">
                            {jogador.pontos}
                          </Badge>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-black">Bebidas</span>
                          <Badge className="bg-red-100 text-red-700 border-red-200 border">
                            {jogador.bebidas}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-bold mb-3 text-center text-black">Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-black">Total de rodadas</p>
                    <p className="font-bold text-xl text-black">{config.rodadas}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-black">Tempo jogado</p>
                    <p className="font-bold text-xl text-black">{Math.floor(tempoDecorrido / 60)} min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-black">Mais acertos</p>
                    <p className="font-bold text-lg text-black">
                      {jogadores.reduce((prev, curr) => 
                        prev.acertos > curr.acertos ? prev : curr
                      ).nome}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-black">Mais bebidas</p>
                    <p className="font-bold text-lg text-black">
                      {jogadores.reduce((prev, curr) => 
                        prev.bebidas > curr.bebidas ? prev : curr
                      ).nome}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={voltarAoMenu}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Menu Principal
              </Button>
              <Button 
                onClick={reiniciarJogo}
                className="bg-purple-700 hover:bg-purple-800"
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Jogar Novamente
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <GameLayout title="Desenha e Bebe" showPlayers={false}>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        {renderizarConteudo()}
      </div>
    </GameLayout>
  );
}