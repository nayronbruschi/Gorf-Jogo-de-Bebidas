import { Beer, Crown, UserPlus, Users, Brain, MessageSquare, Hand, Target, Sparkles, PartyPopper } from "lucide-react";

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  rule: string;
  icon: any;
  specialAction?: "bathroom" | "finger";
}

export const cardRules: Card[] = [
  // Ás
  { suit: "hearts", value: "A", rule: "Manda alguém dar 1 gole!", icon: Target },
  { suit: "diamonds", value: "A", rule: "Manda alguém dar 1 gole!", icon: Target },
  { suit: "clubs", value: "A", rule: "Manda alguém dar 1 gole!", icon: Target },
  { suit: "spades", value: "A", rule: "Manda alguém dar 1 gole!", icon: Target },

  // 2
  { suit: "hearts", value: "2", rule: "Manda alguém dar 2 goles!", icon: Target },
  { suit: "diamonds", value: "2", rule: "Manda alguém dar 2 goles!", icon: Target },
  { suit: "clubs", value: "2", rule: "Manda alguém dar 2 goles!", icon: Target },
  { suit: "spades", value: "2", rule: "Manda alguém dar 2 goles!", icon: Target },

  // 3
  { suit: "hearts", value: "3", rule: "Manda alguém dar 3 goles!", icon: Target },
  { suit: "diamonds", value: "3", rule: "Manda alguém dar 3 goles!", icon: Target },
  { suit: "clubs", value: "3", rule: "Manda alguém dar 3 goles!", icon: Target },
  { suit: "spades", value: "3", rule: "Manda alguém dar 3 goles!", icon: Target },

  // 4
  { suit: "hearts", value: "4", rule: "EU NUNCA! Fale algo que nunca fez, quem já fez bebe!", icon: Brain },
  { suit: "diamonds", value: "4", rule: "EU NUNCA! Fale algo que nunca fez, quem já fez bebe!", icon: Brain },
  { suit: "clubs", value: "4", rule: "EU NUNCA! Fale algo que nunca fez, quem já fez bebe!", icon: Brain },
  { suit: "spades", value: "4", rule: "EU NUNCA! Fale algo que nunca fez, quem já fez bebe!", icon: Brain },

  // 5
  { suit: "hearts", value: "5", rule: "C, S ou Composto! Fale uma palavra que não comece com C ou S e não seja composta!", icon: MessageSquare },
  { suit: "diamonds", value: "5", rule: "C, S ou Composto! Fale uma palavra que não comece com C ou S e não seja composta!", icon: MessageSquare },
  { suit: "clubs", value: "5", rule: "C, S ou Composto! Fale uma palavra que não comece com C ou S e não seja composta!", icon: MessageSquare },
  { suit: "spades", value: "5", rule: "C, S ou Composto! Fale uma palavra que não comece com C ou S e não seja composta!", icon: MessageSquare },

  // 6
  { suit: "hearts", value: "6", rule: "BANHEIRO! Você ganhou o direito de ir ao banheiro!", icon: UserPlus, specialAction: "bathroom" },
  { suit: "diamonds", value: "6", rule: "BANHEIRO! Você ganhou o direito de ir ao banheiro!", icon: UserPlus, specialAction: "bathroom" },
  { suit: "clubs", value: "6", rule: "BANHEIRO! Você ganhou o direito de ir ao banheiro!", icon: UserPlus, specialAction: "bathroom" },
  { suit: "spades", value: "6", rule: "BANHEIRO! Você ganhou o direito de ir ao banheiro!", icon: UserPlus, specialAction: "bathroom" },

  // 7
  { suit: "hearts", value: "7", rule: "PI! Contem de 1 em 1, quando for 7, múltiplo de 7 ou tiver 7, diga PI!", icon: Brain },
  { suit: "diamonds", value: "7", rule: "PI! Contem de 1 em 1, quando for 7, múltiplo de 7 ou tiver 7, diga PI!", icon: Brain },
  { suit: "clubs", value: "7", rule: "PI! Contem de 1 em 1, quando for 7, múltiplo de 7 ou tiver 7, diga PI!", icon: Brain },
  { suit: "spades", value: "7", rule: "PI! Contem de 1 em 1, quando for 7, múltiplo de 7 ou tiver 7, diga PI!", icon: Brain },

  // 8
  { suit: "hearts", value: "8", rule: "Crie uma regra para o jogo!", icon: Crown },
  { suit: "diamonds", value: "8", rule: "Crie uma regra para o jogo!", icon: Crown },
  { suit: "clubs", value: "8", rule: "Crie uma regra para o jogo!", icon: Crown },
  { suit: "spades", value: "8", rule: "Crie uma regra para o jogo!", icon: Crown },

  // 9
  { suit: "hearts", value: "9", rule: "DEDINHO! Você pode colocar o dedo na mesa sem ninguém perceber, último a colocar bebe!", icon: Hand, specialAction: "finger" },
  { suit: "diamonds", value: "9", rule: "DEDINHO! Você pode colocar o dedo na mesa sem ninguém perceber, último a colocar bebe!", icon: Hand, specialAction: "finger" },
  { suit: "clubs", value: "9", rule: "DEDINHO! Você pode colocar o dedo na mesa sem ninguém perceber, último a colocar bebe!", icon: Hand, specialAction: "finger" },
  { suit: "spades", value: "9", rule: "DEDINHO! Você pode colocar o dedo na mesa sem ninguém perceber, último a colocar bebe!", icon: Hand, specialAction: "finger" },

  // 10
  { suit: "hearts", value: "10", rule: "Escolha uma palavra que não pode mais ser falada durante o jogo, quem falar bebe!", icon: MessageSquare },
  { suit: "diamonds", value: "10", rule: "Escolha uma palavra que não pode mais ser falada durante o jogo, quem falar bebe!", icon: MessageSquare },
  { suit: "clubs", value: "10", rule: "Escolha uma palavra que não pode mais ser falada durante o jogo, quem falar bebe!", icon: MessageSquare },
  { suit: "spades", value: "10", rule: "Escolha uma palavra que não pode mais ser falada durante o jogo, quem falar bebe!", icon: MessageSquare },

  // Valetes
  { suit: "hearts", value: "J", rule: "Todos os homens bebem!", icon: Users },
  { suit: "diamonds", value: "J", rule: "Todos os homens bebem!", icon: Users },
  { suit: "clubs", value: "J", rule: "Todos os homens bebem!", icon: Users },
  { suit: "spades", value: "J", rule: "Todos os homens bebem!", icon: Users },

  // Damas
  { suit: "hearts", value: "Q", rule: "Todas as mulheres bebem!", icon: Users },
  { suit: "diamonds", value: "Q", rule: "Todas as mulheres bebem!", icon: Users },
  { suit: "clubs", value: "Q", rule: "Todas as mulheres bebem!", icon: Users },
  { suit: "spades", value: "Q", rule: "Todas as mulheres bebem!", icon: Users },

  // Reis
  { suit: "hearts", value: "K", rule: "A pessoa que tirou essa carta bebe!", icon: Beer },
  { suit: "diamonds", value: "K", rule: "A pessoa que tirou essa carta bebe!", icon: Beer },
  { suit: "clubs", value: "K", rule: "A pessoa que tirou essa carta bebe!", icon: Beer },
  { suit: "spades", value: "K", rule: "A pessoa que tirou essa carta bebe!", icon: Beer }
];