import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { FaGlassCheers } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { GameLayout } from "@/components/GameLayout";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { AlertTriangle, RefreshCcw, ChevronRight } from "lucide-react";
import { startGameSession, updateGameStats } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { SocialShareMenu } from "@/components/SocialShareMenu";

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

// Nomes amigáveis para as categorias
const categoriasNomes = {
  comuns: "Comuns",
  pesadas: "Pesadas",
  eroticas: "Adulto",
  drogas: "Substâncias",
  mistas: "Misturadas"
};

export default function EuNuncaJogo() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [perguntaAtual, setPerguntaAtual] = useState<string | null>(null);
  const [perguntasUsadas, setPerguntasUsadas] = useState<string[]>([]);
  const [categoriaAtual, setCategoriaAtual] = useState<QuestionCategory>("comuns");
  const [mostrarTutorial, setMostrarTutorial] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);
  
  interface Player {
    id: string;
    name: string;
  }
  
  // Buscar jogadores
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });
  
  // Registrar o início do jogo e carregar categoria selecionada
  useEffect(() => {
    // Registrar o jogo nas estatísticas do usuário
    const userId = localStorage.getItem('dev_session');
    if (userId) {
      startGameSession(userId, "Eu Nunca");
      updateGameStats(userId, "Eu Nunca");
    }
    
    // Carregar categoria selecionada
    const categoriaGuardada = localStorage.getItem("euNuncaCategoriaAtual");
    if (categoriaGuardada && ["comuns", "pesadas", "eroticas", "drogas", "mistas"].includes(categoriaGuardada)) {
      setCategoriaAtual(categoriaGuardada as QuestionCategory);
    }
    
    // Verificar se é a primeira vez que o jogo é aberto
    const tutorialVisto = localStorage.getItem("euNuncaTutorialVisto");
    if (!tutorialVisto) {
      setMostrarTutorial(true);
    } else {
      // Se o tutorial já foi visto, gerar a primeira pergunta automaticamente
      gerarNovaPergunta();
    }
  }, []);
  
  // Função para salvar que o tutorial foi visto
  const fecharTutorial = () => {
    localStorage.setItem("euNuncaTutorialVisto", "true");
    setMostrarTutorial(false);
    gerarNovaPergunta();
  };
  
  // Gerar uma nova pergunta aleatória da categoria atual
  const gerarNovaPergunta = () => {
    setAnimatingOut(true);
    
    setTimeout(() => {
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
      } else {
        // Selecionar uma pergunta aleatória das disponíveis
        const randomIndex = Math.floor(Math.random() * perguntasDisponiveis.length);
        const novaPergunta = perguntasDisponiveis[randomIndex];
        setPerguntaAtual(novaPergunta);
        setPerguntasUsadas([...perguntasUsadas, novaPergunta]);
      }
      
      setAnimatingOut(false);
    }, 300);
  };
  
  // Voltar ao menu principal
  const voltarMenu = () => {
    navigate("/game-modes");
  };
  
  return (
    <GameLayout title="Eu Nunca">
      <div className="w-full flex flex-col items-center justify-start px-4">
        <div className="max-w-lg w-full flex flex-col items-center bg-purple-900/70 p-6 rounded-xl shadow-lg">
          <div className="mb-4 text-center">
            <p className="text-white text-lg font-semibold bg-purple-950 px-4 py-2 rounded-full inline-block">
              Categoria: {categoriasNomes[categoriaAtual]}
            </p>
          </div>
          
          <AnimatePresence mode="wait">
            {perguntaAtual && (
              <motion.div
                key={perguntaAtual}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: animatingOut ? 0 : 1, y: animatingOut ? -20 : 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full mb-6"
              >
                <Card className="p-0 overflow-hidden bg-white border-purple-300 shadow-lg">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-purple-800 to-purple-600 p-3 text-white text-center">
                      <h3 className="font-semibold">QUEM JÁ FEZ, BEBE!</h3>
                    </div>
                    <div className="p-8 text-center">
                      <FaGlassCheers className="mx-auto text-purple-700 h-12 w-12 mb-4" />
                      <p className="text-2xl font-bold text-purple-900 mb-4">{perguntaAtual}</p>
                      
                      {players.length > 0 && (
                        <div className="mt-6 bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm text-purple-700 font-medium">Jogadores: {players.map((p: Player) => p.name).join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="w-full space-y-4">
            <Button
              className="w-full bg-green-700 hover:bg-green-800 text-white py-6 text-lg"
              onClick={gerarNovaPergunta}
            >
              <RefreshCcw className="mr-2 h-5 w-5" />
              Próxima Pergunta
            </Button>
            
            <div className="flex justify-center">
              <SocialShareMenu 
                gameTitle="Eu Nunca"
                gameDescription="Jogo de perguntas indiscretas! Quem já fez, bebe!"
                buttonVariant="outline"
                buttonSize="sm"
                showLabel={true}
                className="bg-purple-700 hover:bg-purple-800 text-white hover:text-white"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tutorial */}
      {mostrarTutorial && (
        <TutorialOverlay onClose={fecharTutorial}>
          <div className="space-y-4 text-purple-900">
            <h3 className="text-2xl font-bold text-center mb-4">Como Jogar "Eu Nunca"</h3>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-purple-900 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</div>
                <div>Um jogador lê em voz alta a afirmação que aparece na tela.</div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-purple-900 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</div>
                <div>Todos os jogadores que <strong>já fizeram</strong> o que está na afirmação devem beber.</div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-purple-900 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</div>
                <div>O grupo pode comentar e fazer perguntas sobre as experiências.</div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-purple-900 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">4</div>
                <div>Clique em "Próxima Pergunta" para continuar o jogo.</div>
              </li>
            </ul>
          </div>
        </TutorialOverlay>
      )}
    </GameLayout>
  );
}