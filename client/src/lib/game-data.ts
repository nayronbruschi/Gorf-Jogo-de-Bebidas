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
  Footprints,
  BrainCircuit
} from "lucide-react";

interface Challenge {
  text: string;
  icon: LucideIcon;
}

export const classicChallenges: Challenge[] = [
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