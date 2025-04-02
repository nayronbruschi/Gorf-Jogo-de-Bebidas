import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FaGlassCheers } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameLayout } from "@/components/GameLayout";
import { startGameSession, updateGameStats } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { AlertTriangle, Info, Eye, Pill, Smile, Flame, Zap } from "lucide-react";

// Categorias de perguntas para o jogo Eu Nunca
type QuestionCategory = "comuns" | "pesadas" | "eroticas" | "drogas" | "mistas";

// Definição das perguntas por categoria
interface QuestionsByCategory {
  [key: string]: string[];
}

// Perguntas comuns (leves)
const questoesComuns = [
  "Eu nunca fiquei tão bêbado(a) que não me lembrava do que tinha acontecido no dia anterior",
  "Eu nunca fui barrado(a) na entrada de uma festa ou balada",
  "Eu nunca enviei mensagem para a pessoa errada e me arrependi muito",
  "Eu nunca fui pego(a) no flagra pelos meus pais fazendo algo proibido",
  "Eu nunca colei em uma prova",
  "Eu nunca fingi estar doente para faltar ao trabalho/escola",
  "Eu nunca fiquei com alguém do grupo de amigos",
  "Eu nunca fiz algo e culpei outra pessoa",
  "Eu nunca fingi que reconhecia alguém que não lembrava quem era",
  "Eu nunca caí em público de uma forma constrangedora",
  "Eu nunca passei mais de 24 horas sem tomar banho",
  "Eu nunca menti na minha idade para entrar em algum lugar",
  "Eu nunca me gabei de algo que não era verdade",
  "Eu nunca me peguei cantando no chuveiro",
  "Eu nunca olhei o celular de alguém sem permissão",
  "Eu nunca fiquei com duas pessoas diferentes no mesmo dia",
  "Eu nunca entrei no cinema sem pagar",
  "Eu nunca fui o único sóbrio em uma festa",
  "Eu nunca fiquei preso(a) em um elevador",
  "Eu nunca postei algo nas redes sociais e me arrependi depois",
  "Eu nunca voltei com um(a) ex",
  "Eu nunca tive um perfil falso nas redes sociais",
  "Eu nunca quebrei algo na casa de outra pessoa e não contei",
  "Eu nunca fiz xixi na piscina",
  "Eu nunca deixei alguém no vácuo de propósito",
  "Eu nunca dei uma desculpa falsa para cancelar planos",
  "Eu nunca tive um crush em professor(a)",
  "Eu nunca terminei por mensagem de texto",
  "Eu nunca saí de casa de pijama",
  "Eu nunca dormi em aula/reunião"
];

// Perguntas pesadas (mais intensas)
const questoesPesadas = [
  "Eu nunca traí alguém",
  "Eu nunca terminei um relacionamento por mensagem",
  "Eu nunca fui expulso(a) de um estabelecimento",
  "Eu nunca me envolvi em uma briga física",
  "Eu nunca fui detido(a) pela polícia",
  "Eu nunca perdi uma amizade por uma discussão boba",
  "Eu nunca falei mal de alguém que estava no mesmo ambiente",
  "Eu nunca dirigi alcoolizado(a)",
  "Eu nunca fui infiel em pensamento",
  "Eu nunca menti para alguém que eu amava",
  "Eu nunca roubei algo de uma loja",
  "Eu nunca fiquei com o(a) ex de um(a) amigo(a)",
  "Eu nunca fiz algo ilegal",
  "Eu nunca disse 'eu te amo' sem realmente sentir",
  "Eu nunca saí com mais de uma pessoa ao mesmo tempo (sem eles saberem)",
  "Eu nunca inventei uma história para parecer mais interessante",
  "Eu nunca fingi ter orgasmo",
  "Eu nunca falei algo quando bêbado(a) que me arrependi depois",
  "Eu nunca fiz algo extremamente perigoso",
  "Eu nunca me aproveitei da bondade de alguém",
  "Eu nunca fiz ghosting em alguém",
  "Eu nunca invejei profundamente algo de outra pessoa",
  "Eu nunca briguei em público",
  "Eu nunca chantageei alguém",
  "Eu nunca quebrei a promessa de um segredo importante"
];

// Perguntas eróticas/sexuais
const questoesEroticas = [
  "Eu nunca fiquei com mais de uma pessoa na mesma noite",
  "Eu nunca mandei nudes",
  "Eu nunca fiquei com alguém do mesmo sexo",
  "Eu nunca tive um sonho erótico com alguém deste grupo",
  "Eu nunca fiz sexo em um lugar público",
  "Eu nunca fui a um motel",
  "Eu nunca usei brinquedo erótico",
  "Eu nunca fiz sexo a três",
  "Eu nunca fiquei com alguém bem mais velho/novo que eu",
  "Eu nunca fantasiei sobre alguém presente neste jogo",
  "Eu nunca fingi prazer sexual",
  "Eu nunca fiz sexo em um veículo",
  "Eu nunca recebi ou fiz uma massagem erótica",
  "Eu nunca fui a um clube de strip",
  "Eu nunca fiz ou recebi uma lap dance",
  "Eu nunca participei de um jogo de strip",
  "Eu nunca fui flagrado(a) durante o sexo",
  "Eu nunca fiz sexo no primeiro encontro",
  "Eu nunca tive uma experiência com algemas ou amarras",
  "Eu nunca mandei mensagem com conteúdo sexual para a pessoa errada",
  "Eu nunca fiz sexo em pé",
  "Eu nunca tive uma experiência sexual desconfortável por causa de um lugar estranho",
  "Eu nunca assisti filme adulto com outra pessoa",
  "Eu nunca me masturbei pensando em alguém deste grupo",
  "Eu nunca fiquei com mais de dez pessoas diferentes"
];

// Perguntas relacionadas a drogas
const questoesDrogas = [
  "Eu nunca experimentei maconha",
  "Eu nunca fumei cigarro",
  "Eu nunca misturei diferentes tipos de bebidas em uma noite",
  "Eu nunca bebi até desmaiar",
  "Eu nunca tomei bebida alcoólica escondido",
  "Eu nunca bebi antes dos 18 anos",
  "Eu nunca experimentei qualquer tipo de droga ilícita",
  "Eu nunca tive uma ressaca tão forte que jurei nunca mais beber",
  "Eu nunca fiquei de ressaca por mais de um dia",
  "Eu nunca menti sobre o quanto bebi",
  "Eu nunca fiz algo sob influência de substâncias que me arrependi depois",
  "Eu nunca dirigi depois de beber qualquer quantidade de álcool",
  "Eu nunca passei mal por misturar bebidas",
  "Eu nunca tomei remédio com álcool",
  "Eu nunca bebi sozinho(a)",
  "Eu nunca passei mal por causa de bebida em uma festa",
  "Eu nunca vim a uma festa apenas por causa da bebida gratuita",
  "Eu nunca tomei um porre antes de um compromisso importante",
  "Eu nunca bebi para ganhar coragem de fazer algo",
  "Eu nunca escondi o quanto realmente bebo das pessoas próximas"
];

// Todas as perguntas organizadas por categoria
const todasQuestoes: QuestionsByCategory = {
  comuns: questoesComuns,
  pesadas: questoesPesadas,
  eroticas: questoesEroticas,
  drogas: questoesDrogas,
  mistas: [...questoesComuns, ...questoesPesadas, ...questoesEroticas, ...questoesDrogas]
};

// Ícones para cada categoria
const categoriasIcons = {
  comuns: Smile,
  pesadas: Flame,
  eroticas: Eye,
  drogas: Pill,
  mistas: Zap
};

// Nomes amigáveis para as categorias
const categoriasNomes = {
  comuns: "Comuns",
  pesadas: "Pesadas",
  eroticas: "Adulto",
  drogas: "Substâncias",
  mistas: "Misturadas"
};

export default function EuNunca() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [perguntaAtual, setPerguntaAtual] = useState<string | null>(null);
  const [perguntasUsadas, setPerguntasUsadas] = useState<string[]>([]);
  const [categoriaAtual, setCategoriaAtual] = useState<QuestionCategory>("comuns");
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [mostrarAlertaAdulto, setMostrarAlertaAdulto] = useState(false);
  const [mostrarAlertaDrogas, setMostrarAlertaDrogas] = useState(false);
  
  // Registrar o início do jogo nas estatísticas
  useEffect(() => {
    const userId = localStorage.getItem('dev_session');
    if (userId) {
      startGameSession(userId, "Eu Nunca");
      updateGameStats(userId, "Eu Nunca");
    }
    
    // Verificar se é a primeira vez que o jogo é aberto
    const tutorialVisto = localStorage.getItem("euNuncaTutorialVisto");
    if (!tutorialVisto) {
      setMostrarTutorial(true);
    }
  }, []);
  
  // Registrar quando o jogo é iniciado pela primeira vez
  useEffect(() => {
    if (perguntaAtual) {
      const userId = localStorage.getItem('dev_session');
      if (userId) {
        updateGameStats(userId, "Eu Nunca");
      }
    }
  }, [perguntaAtual]);
  
  // Função para salvar que o tutorial foi visto
  const fecharTutorial = () => {
    localStorage.setItem("euNuncaTutorialVisto", "true");
    setMostrarTutorial(false);
  };
  
  // Gerar uma nova pergunta aleatória da categoria atual
  const gerarNovaPergunta = () => {
    const perguntasDisponiveis = todasQuestoes[categoriaAtual].filter(
      (pergunta) => !perguntasUsadas.includes(pergunta)
    );
    
    // Se todas as perguntas já foram usadas, resetar
    if (perguntasDisponiveis.length === 0) {
      setPerguntasUsadas([]);
      const randomIndex = Math.floor(Math.random() * todasQuestoes[categoriaAtual].length);
      const novaPergunta = todasQuestoes[categoriaAtual][randomIndex];
      setPerguntaAtual(novaPergunta);
      setPerguntasUsadas([novaPergunta]);
      return;
    }
    
    // Selecionar uma pergunta aleatória das disponíveis
    const randomIndex = Math.floor(Math.random() * perguntasDisponiveis.length);
    const novaPergunta = perguntasDisponiveis[randomIndex];
    setPerguntaAtual(novaPergunta);
    setPerguntasUsadas([...perguntasUsadas, novaPergunta]);
  };
  
  // Mudar a categoria de perguntas
  const mudarCategoria = (novaCategoria: QuestionCategory) => {
    // Verificar se a categoria requer confirmação
    if (novaCategoria === "eroticas" && !localStorage.getItem("euNuncaAdultoConfirmado")) {
      setMostrarAlertaAdulto(true);
      return;
    }
    
    if (novaCategoria === "drogas" && !localStorage.getItem("euNuncaDrogasConfirmado")) {
      setMostrarAlertaDrogas(true);
      return;
    }
    
    // Se não requer confirmação ou já foi confirmada, mudar a categoria
    setCategoriaAtual(novaCategoria);
    setPerguntasUsadas([]);
    setPerguntaAtual(null);
  };
  
  // Confirmar seleção de categoria adulta
  const confirmarCategoriaAdulto = () => {
    localStorage.setItem("euNuncaAdultoConfirmado", "true");
    setCategoriaAtual("eroticas");
    setPerguntasUsadas([]);
    setPerguntaAtual(null);
    setMostrarAlertaAdulto(false);
  };
  
  // Confirmar seleção de categoria de drogas
  const confirmarCategoriaDrogas = () => {
    localStorage.setItem("euNuncaDrogasConfirmado", "true");
    setCategoriaAtual("drogas");
    setPerguntasUsadas([]);
    setPerguntaAtual(null);
    setMostrarAlertaDrogas(false);
  };
  
  // Voltar ao menu principal
  const voltarMenu = () => {
    navigate("/game-modes");
  };
  
  // Determinar o ícone com base na categoria atual
  const CategoriaIcon = categoriasIcons[categoriaAtual];
  
  return (
    <GameLayout title="" showPlayers={false}>
      <div className="w-full h-full min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 py-10 px-4 flex justify-center items-center">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border-none">
          <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-6 relative">
            <div className="flex justify-center items-center">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('/glass-pattern.svg')] opacity-10"></div>
              <h2 className="text-2xl font-bold text-white relative z-10">Eu Nunca</h2>
            </div>
            <p className="text-white/90 mt-2 text-center font-medium relative z-10">
              Quem já fez, bebe! Simples assim.
            </p>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue="categorias" className="mb-4">
              <TabsList className="w-full grid grid-cols-3 bg-gray-100 rounded-full p-1.5">
                <TabsTrigger value="categorias" className="rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categorias
                </TabsTrigger>
                <TabsTrigger value="regras" className="rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Como Jogar
                </TabsTrigger>
                <TabsTrigger value="jogo" className="rounded-full data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Jogo
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="jogo" className="space-y-6 pt-4">
                {perguntaAtual ? (
                  <div className="text-center space-y-8">
                    <div className="bg-gradient-to-b from-purple-50 to-white p-8 rounded-2xl shadow-lg border border-purple-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400"></div>
                      
                      <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-purple-100 mb-8 flex items-center justify-center">
                        <div className="bg-purple-100 rounded-full p-3 mr-3">
                          <CategoriaIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs text-purple-500 font-medium">CATEGORIA</p>
                          <p className="text-sm font-bold text-purple-900">{categoriasNomes[categoriaAtual]}</p>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <p className="text-2xl font-bold text-gray-800 leading-tight">{perguntaAtual}</p>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-3 text-gray-500 text-sm mb-2">
                        <FaGlassCheers className="text-purple-400 h-5 w-5" />
                        <p>Quem já fez, bebe!</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <Button 
                        className="w-full bg-gorf-green hover:bg-green-700 text-white rounded-full py-6 shadow-md"
                        onClick={gerarNovaPergunta}
                      >
                        <div className="flex items-center justify-center w-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Próxima Pergunta
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-8">
                    <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100">
                      <div className="flex flex-col items-center justify-center mb-6">
                        <div className="bg-gradient-to-r from-purple-100 to-purple-50 p-6 rounded-full mb-6">
                          <FaGlassCheers className="text-purple-600 h-16 w-16" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          Categoria: {categoriasNomes[categoriaAtual]}
                        </h3>
                        <p className="text-gray-600">
                          Prepare-se para divertidas revelações com os amigos!
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                        <p className="text-purple-800 font-medium text-sm">
                          Quem já fez a ação mencionada, bebe! Simples assim.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gorf-green hover:bg-green-700 text-white rounded-full py-7 shadow-md"
                      onClick={gerarNovaPergunta}
                    >
                      <div className="flex items-center justify-center w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Iniciar Jogo
                      </div>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="categorias" className="space-y-4 pt-4">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  Escolha a categoria de perguntas para o jogo:
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      categoriaAtual === "comuns" 
                        ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm" 
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={() => mudarCategoria("comuns")}
                  >
                    <div className={`rounded-full p-3 mr-4 ${
                      categoriaAtual === "comuns" ? "bg-gorf-green" : "bg-gray-100"
                    }`}>
                      <Smile className={`h-5 w-5 ${
                        categoriaAtual === "comuns" ? "text-white" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        categoriaAtual === "comuns" ? "text-green-800" : "text-gray-800"
                      }`}>Comuns</h3>
                      <p className={`text-xs ${
                        categoriaAtual === "comuns" ? "text-green-700" : "text-gray-500"
                      }`}>Perguntas leves para todas as idades</p>
                    </div>
                    {categoriaAtual === "comuns" && (
                      <div className="bg-gorf-green text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      categoriaAtual === "pesadas" 
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 shadow-sm" 
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={() => mudarCategoria("pesadas")}
                  >
                    <div className={`rounded-full p-3 mr-4 ${
                      categoriaAtual === "pesadas" ? "bg-orange-500" : "bg-gray-100"
                    }`}>
                      <Flame className={`h-5 w-5 ${
                        categoriaAtual === "pesadas" ? "text-white" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        categoriaAtual === "pesadas" ? "text-orange-800" : "text-gray-800"
                      }`}>Pesadas</h3>
                      <p className={`text-xs ${
                        categoriaAtual === "pesadas" ? "text-orange-700" : "text-gray-500"
                      }`}>Perguntas mais intensas e provocativas</p>
                    </div>
                    {categoriaAtual === "pesadas" && (
                      <div className="bg-orange-500 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      categoriaAtual === "eroticas" 
                        ? "bg-gradient-to-r from-red-50 to-red-100 border-red-200 shadow-sm" 
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={() => mudarCategoria("eroticas")}
                  >
                    <div className={`rounded-full p-3 mr-4 ${
                      categoriaAtual === "eroticas" ? "bg-red-500" : "bg-gray-100"
                    }`}>
                      <Eye className={`h-5 w-5 ${
                        categoriaAtual === "eroticas" ? "text-white" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        categoriaAtual === "eroticas" ? "text-red-800" : "text-gray-800"
                      }`}>Adulto</h3>
                      <p className={`text-xs ${
                        categoriaAtual === "eroticas" ? "text-red-700" : "text-gray-500"
                      }`}>Conteúdo +18 com temas sensuais</p>
                    </div>
                    {categoriaAtual === "eroticas" && (
                      <div className="bg-red-500 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      categoriaAtual === "drogas" 
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm" 
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={() => mudarCategoria("drogas")}
                  >
                    <div className={`rounded-full p-3 mr-4 ${
                      categoriaAtual === "drogas" ? "bg-blue-500" : "bg-gray-100"
                    }`}>
                      <Pill className={`h-5 w-5 ${
                        categoriaAtual === "drogas" ? "text-white" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        categoriaAtual === "drogas" ? "text-blue-800" : "text-gray-800"
                      }`}>Substâncias</h3>
                      <p className={`text-xs ${
                        categoriaAtual === "drogas" ? "text-blue-700" : "text-gray-500"
                      }`}>Temas sobre bebidas e substâncias</p>
                    </div>
                    {categoriaAtual === "drogas" && (
                      <div className="bg-blue-500 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${
                      categoriaAtual === "mistas" 
                        ? "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 shadow-sm" 
                        : "bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50"
                    }`}
                    onClick={() => mudarCategoria("mistas")}
                  >
                    <div className={`rounded-full p-3 mr-4 ${
                      categoriaAtual === "mistas" ? "bg-purple-600" : "bg-gray-100"
                    }`}>
                      <Zap className={`h-5 w-5 ${
                        categoriaAtual === "mistas" ? "text-white" : "text-purple-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold ${
                        categoriaAtual === "mistas" ? "text-purple-800" : "text-gray-800"
                      }`}>Misturadas</h3>
                      <p className={`text-xs ${
                        categoriaAtual === "mistas" ? "text-purple-700" : "text-gray-500"
                      }`}>Todas as categorias combinadas</p>
                    </div>
                    {categoriaAtual === "mistas" && (
                      <div className="bg-purple-600 text-white rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => {
                      const selectTab = document.querySelector('[data-state="inactive"][value="regras"]');
                      if (selectTab) {
                        (selectTab as HTMLElement).click();
                      }
                    }}
                    className="bg-gorf-green hover:bg-green-700 text-white mt-2"
                  >
                    Próximo: Ver Como Jogar
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="regras" className="space-y-6 pt-4">
                <div className="bg-gradient-to-b from-purple-50 to-white p-6 rounded-2xl shadow-md border border-purple-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400"></div>
                  
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl text-purple-900">Como Jogar</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-purple-50">
                      <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-700 font-bold">1</span>
                      </div>
                      <p className="text-gray-800">Uma pergunta <span className="font-semibold">"Eu Nunca..."</span> será apresentada</p>
                    </div>
                    
                    <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-purple-50">
                      <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-700 font-bold">2</span>
                      </div>
                      <p className="text-gray-800">Todos que <span className="font-semibold">já fizeram</span> a ação mencionada devem beber</p>
                    </div>
                    
                    <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-purple-50">
                      <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-700 font-bold">3</span>
                      </div>
                      <p className="text-gray-800">Quem nunca fez, não bebe</p>
                    </div>
                    
                    <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-purple-50">
                      <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-700 font-bold">4</span>
                      </div>
                      <p className="text-gray-800">Seja honesto(a)! O jogo fica mais divertido assim</p>
                    </div>
                    
                    <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border border-purple-50">
                      <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-purple-700 font-bold">5</span>
                      </div>
                      <p className="text-gray-800">Você pode compartilhar histórias após cada rodada</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-b from-amber-50 to-white p-6 rounded-2xl shadow-md border border-amber-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-300"></div>
                  
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <Info className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-xl text-amber-800">Dicas Importantes</h3>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50 mb-3">
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <p className="text-gray-800 text-sm">
                        Categorias <span className="font-medium text-red-600">"Adulto"</span> e <span className="font-medium text-blue-600">"Substâncias"</span> são recomendadas para maiores de 18 anos
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50 mb-3">
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-800 text-sm">
                        Jogue com responsabilidade e respeite os limites dos participantes
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-50">
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-gray-800 text-sm">
                        Sempre tenha uma opção não-alcoólica disponível para quem não bebe
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => {
                      const selectTab = document.querySelector('[data-state="inactive"][value="jogo"]');
                      if (selectTab) {
                        (selectTab as HTMLElement).click();
                      }
                      if (!perguntaAtual) {
                        gerarNovaPergunta();
                      }
                    }}
                    className="bg-gorf-green hover:bg-green-700 text-white mt-2"
                  >
                    Iniciar Jogo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-center p-4 bg-purple-700 text-white">
            <Button 
              className="bg-white text-purple-700 hover:bg-gray-100 w-full text-lg font-medium py-6"
              onClick={() => {
                const selectTab = document.querySelector('[data-state="inactive"][value="jogo"]');
                if (selectTab) {
                  (selectTab as HTMLElement).click();
                }
                if (!perguntaAtual) {
                  gerarNovaPergunta();
                }
              }}
            >
              {perguntaAtual ? "Continuar Jogando" : "Começar a Jogar"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Alerta de conteúdo adulto */}
      <AlertDialog open={mostrarAlertaAdulto} onOpenChange={setMostrarAlertaAdulto}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-lg border-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-400 rounded-t-2xl"></div>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-700 mt-2">
              <div className="bg-red-100 p-2 rounded-full mr-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              Conteúdo Adulto (+18)
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-2 mb-1">
                Esta categoria contém perguntas com conteúdo explícito de natureza sexual e só deve ser jogada por maiores de 18 anos em um ambiente adequado.
              </div>
              <p className="mt-2 text-sm">Todos os participantes devem estar confortáveis com este tipo de conteúdo.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaAdulto} className="bg-gorf-green hover:bg-green-700 rounded-full">
              Confirmar (+18)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Alerta de conteúdo sobre drogas */}
      <AlertDialog open={mostrarAlertaDrogas} onOpenChange={setMostrarAlertaDrogas}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-lg border-none">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl"></div>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-blue-700 mt-2">
              <div className="bg-blue-100 p-2 rounded-full mr-2">
                <AlertTriangle className="h-5 w-5 text-blue-500" />
              </div>
              Conteúdo Sensível
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2 mb-1">
                Esta categoria contém perguntas relacionadas a álcool, drogas e substâncias. Lembre-se que o consumo de substâncias ilícitas é crime.
              </div>
              <p className="mt-2 text-sm">Jogue com responsabilidade e esteja ciente dos riscos à saúde associados ao consumo de álcool e outras substâncias.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaDrogas} className="bg-gorf-green hover:bg-green-700 rounded-full">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Tutorial do jogo */}
      <TutorialOverlay
        show={mostrarTutorial}
        onClose={fecharTutorial}
        title="Bem-vindo ao Eu Nunca!"
        steps={[
          {
            title: "Escolha uma categoria",
            description: "Selecione o tipo de perguntas que você quer jogar. Cada categoria tem um tema diferente.",
            imagen: <div className="bg-white p-4 rounded-2xl shadow">
              <div className="flex items-center p-4 rounded-xl border bg-gradient-to-r from-green-50 to-green-100 border-green-200 shadow-sm">
                <div className="rounded-full p-3 mr-4 bg-gorf-green">
                  <Smile className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800">Comuns</h3>
                  <p className="text-xs text-green-700">Perguntas leves para todas as idades</p>
                </div>
              </div>
            </div>
          },
          {
            title: "Conheça as regras",
            description: "No jogo 'Eu Nunca', todos que já fizeram a ação mencionada devem beber. Simples assim!",
            imagen: <div className="flex items-center bg-white rounded-lg p-3 shadow-sm border">
              <div className="bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="text-purple-700 font-bold">2</span>
              </div>
              <p className="text-gray-800">Todos que <span className="font-semibold">já fizeram</span> a ação mencionada devem beber</p>
            </div>
          },
          {
            title: "Jogue com responsabilidade",
            description: "Respeite os limites dos participantes e tenha sempre uma opção não-alcoólica disponível.",
            imagen: <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <p className="text-amber-800 font-medium text-sm">
                  Jogue com responsabilidade e respeite os limites dos participantes
                </p>
              </div>
            </div>
          },
          {
            title: "Vamos começar!",
            description: "Clique em 'Iniciar Jogo' e divirta-se com seus amigos neste jogo de revelações!",
            imagen: <Button 
              className="w-full bg-gorf-green hover:bg-green-700 text-white rounded-full py-4 shadow-md"
            >
              <div className="flex items-center justify-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Iniciar Jogo
              </div>
            </Button>
          }
        ]}
      />
    </GameLayout>
  );
}