import {
  Dumbbell,
  UserRound,
  Music,
  Smile,
  Drama,
  LucideIcon,
  Lightbulb,
  MessageSquare,
  HeartHandshake,
  PartyPopper,
  Brain,
  SmilePlus,
  Laugh,
  Mic2,
  Activity,
  Heart,
  Beer,
  Home,
  Sparkles
} from "lucide-react";

interface Challenge {
  text: string;
  icon: LucideIcon;
}

interface DeckType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  challenges: Challenge[];
}

// Desafios clássicos
const classicChallenges: Challenge[] = [
  { text: "Faça 10 polichinelos", icon: Dumbbell },
  { text: "Imite alguém do grupo", icon: UserRound },
  { text: "Dance por 30 segundos", icon: PartyPopper },
  { text: "Conte uma história engraçada", icon: MessageSquare },
  { text: "Faça uma mímica", icon: Drama },
  { text: "Cante uma música", icon: Music },
  { text: "Faça 5 flexões", icon: Dumbbell },
  { text: "Imite um animal por 1 minuto", icon: Smile },
  { text: "Conte uma piada", icon: Laugh },
  { text: "Faça uma pose de yoga", icon: Activity },
  { text: "Faça uma imitação de um famoso", icon: Mic2 },
  { text: "Invente uma rima com o nome de outro jogador", icon: Brain },
  { text: "Faça uma dança engraçada", icon: PartyPopper },
  { text: "Conte um segredo (nada muito pessoal)", icon: MessageSquare },
  { text: "Faça uma careta engraçada", icon: SmilePlus }
];

// Desafios para beber
const drinkingChallenges: Challenge[] = [
  { text: "Beba um shot inteiro", icon: Beer },
  { text: "Vire seu copo", icon: Beer },
  { text: "Escolha alguém para beber com você", icon: Beer },
  { text: "Faça um brinde e beba", icon: Beer },
  { text: "Todos bebem!", icon: Beer },
  { text: "Beba sem usar as mãos", icon: Beer },
  { text: "Quem errar a contagem bebe", icon: Beer },
  { text: "Último a levantar o braço bebe", icon: Beer },
  { text: "Imite alguém do grupo, se ninguém adivinhar, você bebe", icon: Beer },
  { text: "Crie uma regra de bebida", icon: Beer }
];

// Desafios família
const familyChallenges: Challenge[] = [
  { text: "Conte uma história da sua infância", icon: Home },
  { text: "Imite um parente", icon: Home },
  { text: "Fale um momento engraçado em família", icon: Home },
  { text: "Cante uma música que seus pais cantavam", icon: Home },
  { text: "Mostre uma foto antiga da família", icon: Home },
  { text: "Faça uma mímica de um momento familiar", icon: Home },
  { text: "Conte uma tradição da sua família", icon: Home },
  { text: "Imite seu animal de estimação", icon: Home },
  { text: "Fale uma frase típica dos seus pais", icon: Home },
  { text: "Conte uma história engraçada de um parente", icon: Home }
];

// Desafios picantes
const spicyChallenges: Challenge[] = [
  { text: "Beije alguém do grupo", icon: Heart },
  { text: "Faça uma massagem em alguém", icon: Heart },
  { text: "Conte uma história picante", icon: Heart },
  { text: "Escolha alguém para um selinho", icon: Heart },
  { text: "Dance sensualmente", icon: Heart },
  { text: "Dê um abraço em alguém por 10 segundos", icon: Heart },
  { text: "Faça um elogio para cada pessoa", icon: Heart },
  { text: "Confesse uma atração", icon: Heart },
  { text: "Jogue verdade ou consequência", icon: Heart },
  { text: "Revelar uma fantasia", icon: Heart }
];

export const decks: DeckType[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Desafios divertidos e clássicos para todos!",
    icon: Sparkles,
    challenges: classicChallenges
  },
  {
    id: "drinking",
    name: "Bora Beber",
    description: "Desafios focados em beber e diversão!",
    icon: Beer,
    challenges: drinkingChallenges
  },
  {
    id: "family",
    name: "Modo Família",
    description: "Desafios leves e divertidos para toda a família!",
    icon: Home,
    challenges: familyChallenges
  },
  {
    id: "spicy",
    name: "Picante",
    description: "Desafios mais ousados e sensuais!",
    icon: Heart,
    challenges: spicyChallenges
  }
];

export const truthQuestions = [
  "Qual foi sua pior ressaca?",
  "Qual é seu maior arrependimento?",
  "Qual foi a coisa mais embaraçosa que você já fez bêbado?",
  "Qual é seu maior segredo?",
  "Qual foi a maior mentira que você já contou?",
];

export const dares = [
  "Dance por 30 segundos",
  "Faça 5 flexões",
  "Imite um animal por 1 minuto",
  "Cante uma música",
  "Faça uma pose de yoga",
];

export const nonAlcoholicChallenges = [
  "Pule 10 vezes",
  "Faça uma careta engraçada",
  "Conte uma piada",
  "Faça uma mímica",
  "Invente uma dança",
];