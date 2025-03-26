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
      <div className="w-full h-full min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 py-10 px-4 flex justify-center items-center">
        <div className="w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white p-5">
            <div className="flex justify-center items-center">
              <h2 className="text-2xl font-bold text-white">Eu Nunca</h2>
            </div>
            <p className="text-white mt-2 text-center font-medium">
              Quem já fez, bebe! Simples assim.
            </p>
          </div>
          
          <div className="p-6">
            <Tabs defaultValue="categorias" className="mb-4">
              <TabsList className="w-full bg-purple-100">
                <TabsTrigger value="categorias" className="flex-1 data-[state=active]:bg-purple-700 data-[state=active]:text-white">Categorias</TabsTrigger>
                <TabsTrigger value="regras" className="flex-1 data-[state=active]:bg-purple-700 data-[state=active]:text-white">Como Jogar</TabsTrigger>
                <TabsTrigger value="jogo" className="flex-1 data-[state=active]:bg-purple-700 data-[state=active]:text-white">Jogo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="jogo" className="space-y-6 pt-4">
                {perguntaAtual ? (
                  <div className="text-center space-y-8">
                    <div className="bg-purple-100 p-6 rounded-lg border-2 border-purple-300 shadow-lg">
                      <CategoriaIcon className="mx-auto h-12 w-12 text-purple-700 mb-4" />
                      <p className="text-xl font-bold text-purple-900 mb-1">{perguntaAtual}</p>
                      <p className="text-sm text-purple-700">
                        Categoria: {categoriasNomes[categoriaAtual]}
                      </p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      <Button 
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                        onClick={gerarNovaPergunta}
                      >
                        Próxima Pergunta
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="flex justify-center">
                      <FaGlassCheers className="text-purple-700 h-20 w-20" />
                    </div>
                    <p className="text-lg text-purple-900 font-medium">
                      Clique no botão abaixo para começar o jogo com perguntas da categoria {categoriasNomes[categoriaAtual]}.
                    </p>
                    <Button 
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white text-lg py-6"
                      onClick={gerarNovaPergunta}
                    >
                      Iniciar Jogo
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="categorias" className="space-y-4 pt-4">
                <p className="text-sm text-purple-900 font-medium mb-2">
                  Escolha a categoria de perguntas para o jogo:
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    variant={categoriaAtual === "comuns" ? "default" : "outline"}
                    className={categoriaAtual === "comuns" ? "bg-purple-700 hover:bg-purple-800 text-white" : ""}
                    onClick={() => mudarCategoria("comuns")}
                  >
                    <Smile className="mr-2 h-4 w-4" />
                    Comuns (Leves)
                  </Button>
                  
                  <Button 
                    variant={categoriaAtual === "pesadas" ? "default" : "outline"}
                    className={categoriaAtual === "pesadas" ? "bg-purple-700 hover:bg-purple-800 text-white" : ""}
                    onClick={() => mudarCategoria("pesadas")}
                  >
                    <Flame className="mr-2 h-4 w-4" />
                    Pesadas (Intensas)
                  </Button>
                  
                  <Button 
                    variant={categoriaAtual === "eroticas" ? "default" : "outline"}
                    className={categoriaAtual === "eroticas" ? "bg-purple-700 hover:bg-purple-800 text-white" : ""}
                    onClick={() => mudarCategoria("eroticas")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Adulto (+18)
                  </Button>
                  
                  <Button 
                    variant={categoriaAtual === "drogas" ? "default" : "outline"}
                    className={categoriaAtual === "drogas" ? "bg-purple-700 hover:bg-purple-800 text-white" : ""}
                    onClick={() => mudarCategoria("drogas")}
                  >
                    <Pill className="mr-2 h-4 w-4" />
                    Substâncias
                  </Button>
                  
                  <Button 
                    variant={categoriaAtual === "mistas" ? "default" : "outline"}
                    className={categoriaAtual === "mistas" ? "bg-purple-700 hover:bg-purple-800 text-white" : ""}
                    onClick={() => mudarCategoria("mistas")}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Misturadas (Todas)
                  </Button>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button 
                    onClick={() => {
                      const selectTab = document.querySelector('[data-state="inactive"][value="regras"]');
                      if (selectTab) {
                        (selectTab as HTMLElement).click();
                      }
                    }}
                    className="bg-purple-700 hover:bg-purple-800 text-white mt-2"
                  >
                    Próximo: Ver Como Jogar
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="regras" className="space-y-4 pt-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-lg mb-2 text-purple-800">Como Jogar</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Uma pergunta "Eu Nunca..." será apresentada</li>
                    <li>Todos que <strong>já fizeram</strong> a ação mencionada devem beber</li>
                    <li>Quem nunca fez, não bebe</li>
                    <li>Seja honesto(a)! O jogo fica mais divertido assim</li>
                    <li>Você pode compartilhar histórias após cada rodada</li>
                    <li>Escolha a categoria que melhor se adequa ao seu grupo</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-yellow-800">Dicas</h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>Categorias "Adulto" e "Substâncias" são recomendadas para maiores de 18 anos</li>
                        <li>Jogue com responsabilidade e respeite os limites dos participantes</li>
                        <li>Sempre tenha uma opção não-alcoólica disponível para quem não bebe</li>
                      </ul>
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
                    className="bg-purple-700 hover:bg-purple-800 text-white mt-2"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Conteúdo Adulto (+18)
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta categoria contém perguntas com conteúdo explícito de natureza sexual e só deve ser jogada por maiores de 18 anos em um ambiente adequado. Todos os participantes devem estar confortáveis com este tipo de conteúdo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaAdulto} className="bg-purple-700 hover:bg-purple-800">
              Confirmar (+18)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Alerta de conteúdo sobre drogas */}
      <AlertDialog open={mostrarAlertaDrogas} onOpenChange={setMostrarAlertaDrogas}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Conteúdo Sensível
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta categoria contém perguntas relacionadas a álcool, drogas e substâncias. Lembre-se que o consumo de substâncias ilícitas é crime. Jogue com responsabilidade e esteja ciente dos riscos à saúde associados ao consumo de álcool e outras substâncias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarCategoriaDrogas} className="bg-purple-700 hover:bg-purple-800">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GameLayout>
  );
}