import {
  GamepadIcon, Brain, HandMetal, CircleDashed, Sparkles, Spade,
  LucideIcon, Heart, Dumbbell, UserRound, Music, Smile, Drama,
  MessageSquare, PartyPopper, Laugh, Mic2, Activity, Beer, Home,
  Camera, Gift, Trophy, Ghost, Star, Megaphone, Palette, Gamepad2,
  Baby, Crown, HeartHandshake, Glasses, Hand, Shirt, Umbrella,
  Soup, Coffee, Flame, Candy, Snowflake, IceCream, Utensils,
  UtensilsCrossed, Cake, Droplet, Wine
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

interface GameType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  route: string;
}

const classicChallenges: Challenge[] = [
  { text: "Faça 10 polichinelos", icon: Dumbbell },
  { text: "Imite alguém do grupo", icon: UserRound },
  { text: "Dance por 30 segundos", icon: Activity },
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
  { text: "Faça uma careta engraçada", icon: Smile },
  { text: "Tire uma selfie engraçada", icon: Camera },
  { text: "Faça uma declaração dramática", icon: Drama },
  { text: "Invente um comercial de TV", icon: Megaphone },
  { text: "Desenhe algo de olhos fechados", icon: Palette },
  { text: "Imite um personagem de videogame", icon: Gamepad2 },
  { text: "Faça malabarismo com 3 objetos", icon: PartyPopper },
  { text: "Crie uma música com objetos da mesa", icon: Music },
  { text: "Faça uma dança robótica", icon: Activity },
  { text: "Conte uma história em 30 segundos", icon: MessageSquare },
  { text: "Imite três emojis", icon: Smile },
  { text: "Faça uma pose de super-herói", icon: Trophy },
  { text: "Invente um trocadilho", icon: Brain },
  { text: "Faça uma imitação de bebê", icon: Baby },
  { text: "Crie um slogan para um produto imaginário", icon: Megaphone },
  { text: "Faça uma mímica de profissão", icon: Drama },
  { text: "Imite um apresentador de TV", icon: Mic2 },
  { text: "Faça uma pose de modelo", icon: Camera },
  { text: "Crie uma coreografia de 10 segundos", icon: Activity },
  { text: "Invente um nome para uma banda", icon: Music },
  { text: "Faça uma imitação de alienígena", icon: Ghost },
  { text: "Crie um rap sobre o jogador à sua direita", icon: Mic2 },
  { text: "Faça uma propaganda de venda", icon: Megaphone },
  { text: "Imite um YouTuber famoso", icon: Camera },
  { text: "Faça uma pose de estátua por 30 segundos", icon: Trophy },
  { text: "Invente um passo de dança", icon: Activity }
];

const drinkingChallenges: Challenge[] = [
  { text: "Beba um shot inteiro", icon: Wine },
  { text: "Vire seu copo", icon: Beer },
  { text: "Escolha alguém para beber com você", icon: HeartHandshake },
  { text: "Faça um brinde e beba", icon: Wine },
  { text: "Todos bebem!", icon: PartyPopper },
  { text: "Beba sem usar as mãos", icon: Hand },
  { text: "Quem errar a contagem bebe", icon: Brain },
  { text: "Último a levantar o braço bebe", icon: Hand },
  { text: "Imite alguém do grupo, se ninguém adivinhar, você bebe", icon: Drama },
  { text: "Crie uma regra de bebida", icon: Crown },
  { text: "Faça um brinde em outro idioma ou beba dobrado", icon: Megaphone },
  { text: "Beba enquanto faz uma pose de yoga", icon: Activity },
  { text: "Desafie alguém para 'pedra, papel, tesoura', perdedor bebe", icon: Hand },
  { text: "Beba a cada vez que alguém disser 'eu'", icon: Beer },
  { text: "Escolha uma música, todos que conhecerem bebem", icon: Music },
  { text: "Invente um drink com o que tiver na mesa", icon: Wine },
  { text: "Faça uma rima ou beba", icon: Brain },
  { text: "Conte uma história de bebedeira", icon: MessageSquare },
  { text: "Beba na vez de outro jogador", icon: HeartHandshake },
  { text: "Imite um bêbado famoso ou beba", icon: Drama },
  { text: "Beba se já dormiu no banheiro", icon: Ghost },
  { text: "Todo mundo que estiver de calça jeans bebe", icon: Shirt },
  { text: "Beba se já mandou mensagem para ex bêbado", icon: MessageSquare },
  { text: "Faça um trocadilho com bebida ou beba dobrado", icon: Brain },
  { text: "Beba se já acordou em lugar estranho", icon: Ghost },
  { text: "Quem tiver piercing ou tatuagem bebe", icon: Activity },
  { text: "Conte uma história vergonhosa ou beba triplo", icon: MessageSquare },
  { text: "Beba na mesma quantidade que sua idade", icon: Baby },
  { text: "Escolha 3 pessoas para beber com você", icon: Crown },
  { text: "Invente um brinde criativo ou beba", icon: Brain },
  { text: "Quem estiver de tênis bebe", icon: Shirt },
  { text: "Beba se já foi expulso de algum lugar", icon: Ghost },
  { text: "Faça uma declaração de amor à bebida", icon: Heart },
  { text: "Beba se já perdeu as chaves bêbado", icon: Ghost },
  { text: "Último a tocar o nariz bebe", icon: Hand },
  { text: "Beba se já cantou karaokê bêbado", icon: Music },
  { text: "Imite seu amigo bêbado ou beba", icon: Drama },
  { text: "Quem tiver smartphone bebe", icon: Activity },
  { text: "Beba se já dançou em cima da mesa", icon: Activity },
  { text: "Crie um drink para o jogador à sua esquerda", icon: Wine }
];

const familyChallenges: Challenge[] = [
  { text: "Conte uma história da sua infância", icon: Baby },
  { text: "Imite um parente", icon: UserRound },
  { text: "Fale um momento engraçado em família", icon: Laugh },
  { text: "Cante uma música que seus pais cantavam", icon: Music },
  { text: "Mostre uma foto antiga da família", icon: Camera },
  { text: "Faça uma mímica de um momento familiar", icon: Drama },
  { text: "Conte uma tradição da sua família", icon: Crown },
  { text: "Imite seu animal de estimação", icon: Smile },
  { text: "Fale uma frase típica dos seus pais", icon: MessageSquare },
  { text: "Conte uma história engraçada de um parente", icon: Laugh },
  { text: "Imite seu irmão/irmã mais novo(a)", icon: UserRound },
  { text: "Recrie uma foto antiga da família", icon: Camera },
  { text: "Conte uma receita de família", icon: Utensils },
  { text: "Faça uma mímica de rotina familiar", icon: Drama },
  { text: "Imite o jeito que sua mãe te chama", icon: Megaphone },
  { text: "Compartilhe uma superstição familiar", icon: Ghost },
  { text: "Conte uma história de Natal em família", icon: Gift },
  { text: "Imite como seu pai dorme", icon: Home },
  { text: "Mostre um talento herdado da família", icon: Star },
  { text: "Conte uma história de viagem em família", icon: Umbrella },
  { text: "Faça uma mímica de almoço em família", icon: UtensilsCrossed },
  { text: "Imite a risada de um parente", icon: Laugh },
  { text: "Conte uma história de erro na cozinha", icon: Utensils },
  { text: "Faça uma dança típica da família", icon: Activity },
  { text: "Imite como sua avó serve comida", icon: UtensilsCrossed },
  { text: "Conte uma história de casamento familiar", icon: Heart },
  { text: "Faça uma mímica de bronca dos pais", icon: Drama },
  { text: "Imite seu primo(a) favorito(a)", icon: UserRound },
  { text: "Conte uma tradição de aniversário", icon: Cake },
  { text: "Faça uma pose típica de foto familiar", icon: Camera },
  { text: "Imite seu tio/tia mais engraçado(a)", icon: Laugh },
  { text: "Conte uma história de primeira comunhão", icon: Crown },
  { text: "Faça uma mímica de domingo em família", icon: Home },
  { text: "Imite a dança do seu pai/mãe", icon: Activity },
  { text: "Conte uma história de formatura", icon: Trophy },
  { text: "Faça uma mímica de café da manhã", icon: Coffee },
  { text: "Imite seu parente mais dramático", icon: Drama },
  { text: "Conte uma história de primeira vez", icon: Baby },
  { text: "Faça uma pose de foto de família", icon: Camera },
  { text: "Imite seu parente mais bravo", icon: Drama }
];

const spicyChallenges: Challenge[] = [
  { text: "Beije alguém do grupo", icon: Flame },
  { text: "Faça uma massagem sensual", icon: Hand },
  { text: "Conte uma fantasia romântica", icon: Heart },
  { text: "Escolha alguém para um selinho", icon: Flame },
  { text: "Dance sensualmente", icon: Activity },
  { text: "Faça um elogio picante", icon: Flame },
  { text: "Confesse uma atração secreta", icon: Heart },
  { text: "Faça um strip-tease (mantenha as roupas)", icon: Flame },
  { text: "Demonstre sua melhor técnica de beijo", icon: Heart },
  { text: "Revele sua fantasia mais ousada", icon: Flame },
  { text: "Deixe alguém fazer body shot em você", icon: Wine },
  { text: "Escolha alguém para um beijo de 10 segundos", icon: Flame },
  { text: "Faça uma dança sensual para alguém", icon: Activity },
  { text: "Conte sua experiência mais quente", icon: Flame },
  { text: "Imite um gemido sensual", icon: Heart },
  { text: "Escolha três pessoas para um selinho", icon: Flame },
  { text: "Faça uma pose sensual", icon: Heart },
  { text: "Demonstre sua melhor cantada", icon: Flame },
  { text: "Beije o pescoço de alguém", icon: Heart },
  { text: "Faça uma declaração provocante", icon: Flame },
  { text: "Escolha alguém para um beijo francês", icon: Heart },
  { text: "Dance lap dance (sem contato)", icon: Activity },
  { text: "Conte seu sonho mais erótico", icon: Flame },
  { text: "Faça uma massagem nos ombros com os olhos vendados", icon: Hand },
  { text: "Beije alguém com dado indicando onde", icon: Heart },
  { text: "Imite um orgasmo", icon: Flame },
  { text: "Faça um elogio picante para cada um", icon: Heart },
  { text: "Dance sensualmente com alguém", icon: Activity },
  { text: "Mostre sua marca de bronzeado", icon: Flame },
  { text: "Deixe alguém dar um chupão em você", icon: Heart },
  { text: "Faça um strip-tease vendado", icon: Flame },
  { text: "Beije três pessoas diferentes", icon: Heart },
  { text: "Demonstre sua posição favorita", icon: Flame },
  { text: "Faça uma massagem nos pés de alguém", icon: Hand },
  { text: "Escolha alguém para um momento quente", icon: Heart },
  { text: "Dance 'Single Ladies' sensualmente", icon: Activity },
  { text: "Beije alguém por 20 segundos", icon: Flame },
  { text: "Faça uma pose de pin-up", icon: Heart },
  { text: "Demonstre como seduz alguém", icon: Flame },
  { text: "Escolha alguém para um momento íntimo", icon: Heart }
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
    icon: Flame,
    challenges: spicyChallenges
  }
];

export const games: GameType[] = [
  {
    id: "gorf",
    name: "Gorf",
    description: "Esse modo é para começar ou terminar o rolê. Quer beber muito? Então clica aqui!",
    icon: Droplet,
    route: "/roulette/start"
  },
  {
    id: "classic",
    name: "Modo Clássico",
    description: "Desafios divertidos e clássicos para todos!",
    icon: GamepadIcon,
    route: "/classic"
  },
  {
    id: "guess-who",
    name: "Quem Sou Eu",
    description: "Adivinhe quem você é neste jogo divertido!",
    icon: Brain,
    route: "/guess-who/players"
  },
  {
    id: "touch-game",
    name: "Toque na Sorte",
    description: "Teste sua sorte neste jogo interativo!",
    icon: HandMetal,
    route: "/touch-game"
  },
  {
    id: "spin-bottle",
    name: "Girar a Garrafa",
    description: "Gire a garrafa e descubra seu destino!",
    icon: CircleDashed,
    route: "/spin-bottle"
  },
  {
    id: "coin-flip",
    name: "Cara ou Coroa",
    description: "Faça sua escolha e teste sua sorte!",
    icon: Sparkles,
    route: "/coin-flip"
  },
  {
    id: "cards",
    name: "Sueca",
    description: "Jogue o clássico jogo de cartas português!",
    icon: Spade,
    route: "/cards"
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