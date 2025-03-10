import { Beer, Crown, Heart, Star, Target, Flame, Sparkles, PartyPopper } from "lucide-react";

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  rule: string;
  icon: any;
}

export const cardRules: Card[] = [
  // Ás
  { suit: "hearts", value: "A", rule: "Todos bebem! O Ás é o rei da festa!", icon: Crown },
  { suit: "diamonds", value: "A", rule: "Todos bebem! O Ás é o rei da festa!", icon: Crown },
  { suit: "clubs", value: "A", rule: "Todos bebem! O Ás é o rei da festa!", icon: Crown },
  { suit: "spades", value: "A", rule: "Todos bebem! O Ás é o rei da festa!", icon: Crown },
  
  // Reis
  { suit: "hearts", value: "K", rule: "Crie uma regra que vale até a próxima rodada!", icon: Star },
  { suit: "diamonds", value: "K", rule: "Crie uma regra que vale até a próxima rodada!", icon: Star },
  { suit: "clubs", value: "K", rule: "Crie uma regra que vale até a próxima rodada!", icon: Star },
  { suit: "spades", value: "K", rule: "Crie uma regra que vale até a próxima rodada!", icon: Star },
  
  // Damas
  { suit: "hearts", value: "Q", rule: "Escolha alguém para beber com você!", icon: Heart },
  { suit: "diamonds", value: "Q", rule: "Escolha alguém para beber com você!", icon: Heart },
  { suit: "clubs", value: "Q", rule: "Escolha alguém para beber com você!", icon: Heart },
  { suit: "spades", value: "Q", rule: "Escolha alguém para beber com você!", icon: Heart },
  
  // Valetes
  { suit: "hearts", value: "J", rule: "Distribua 3 goles entre os jogadores!", icon: Beer },
  { suit: "diamonds", value: "J", rule: "Distribua 3 goles entre os jogadores!", icon: Beer },
  { suit: "clubs", value: "J", rule: "Distribua 3 goles entre os jogadores!", icon: Beer },
  { suit: "spades", value: "J", rule: "Distribua 3 goles entre os jogadores!", icon: Beer },
  
  // 10
  { suit: "hearts", value: "10", rule: "Waterfall! Todos começam a beber, só param quando o jogador à sua direita parar!", icon: Flame },
  { suit: "diamonds", value: "10", rule: "Waterfall! Todos começam a beber, só param quando o jogador à sua direita parar!", icon: Flame },
  { suit: "clubs", value: "10", rule: "Waterfall! Todos começam a beber, só param quando o jogador à sua direita parar!", icon: Flame },
  { suit: "spades", value: "10", rule: "Waterfall! Todos começam a beber, só param quando o jogador à sua direita parar!", icon: Flame },
  
  // 9
  { suit: "hearts", value: "9", rule: "Rima! Escolha uma palavra, próximo jogador rima ou bebe!", icon: PartyPopper },
  { suit: "diamonds", value: "9", rule: "Rima! Escolha uma palavra, próximo jogador rima ou bebe!", icon: PartyPopper },
  { suit: "clubs", value: "9", rule: "Rima! Escolha uma palavra, próximo jogador rima ou bebe!", icon: PartyPopper },
  { suit: "spades", value: "9", rule: "Rima! Escolha uma palavra, próximo jogador rima ou bebe!", icon: PartyPopper },
  
  // 8
  { suit: "hearts", value: "8", rule: "Escolha um parceiro de bebida! Sempre que você beber, ele bebe também!", icon: Heart },
  { suit: "diamonds", value: "8", rule: "Escolha um parceiro de bebida! Sempre que você beber, ele bebe também!", icon: Heart },
  { suit: "clubs", value: "8", rule: "Escolha um parceiro de bebida! Sempre que você beber, ele bebe também!", icon: Heart },
  { suit: "spades", value: "8", rule: "Escolha um parceiro de bebida! Sempre que você beber, ele bebe também!", icon: Heart },
  
  // 7
  { suit: "hearts", value: "7", rule: "Apontar para o céu! Último a apontar bebe!", icon: Target },
  { suit: "diamonds", value: "7", rule: "Apontar para o céu! Último a apontar bebe!", icon: Target },
  { suit: "clubs", value: "7", rule: "Apontar para o céu! Último a apontar bebe!", icon: Target },
  { suit: "spades", value: "7", rule: "Apontar para o céu! Último a apontar bebe!", icon: Target },
  
  // 6
  { suit: "hearts", value: "6", rule: "Os homens bebem!", icon: Beer },
  { suit: "diamonds", value: "6", rule: "Os homens bebem!", icon: Beer },
  { suit: "clubs", value: "6", rule: "Os homens bebem!", icon: Beer },
  { suit: "spades", value: "6", rule: "Os homens bebem!", icon: Beer },
  
  // 5
  { suit: "hearts", value: "5", rule: "As mulheres bebem!", icon: Beer },
  { suit: "diamonds", value: "5", rule: "As mulheres bebem!", icon: Beer },
  { suit: "clubs", value: "5", rule: "As mulheres bebem!", icon: Beer },
  { suit: "spades", value: "5", rule: "As mulheres bebem!", icon: Beer },
  
  // 4
  { suit: "hearts", value: "4", rule: "Categoria! Escolha um tema, cada um fala algo relacionado ou bebe!", icon: Sparkles },
  { suit: "diamonds", value: "4", rule: "Categoria! Escolha um tema, cada um fala algo relacionado ou bebe!", icon: Sparkles },
  { suit: "clubs", value: "4", rule: "Categoria! Escolha um tema, cada um fala algo relacionado ou bebe!", icon: Sparkles },
  { suit: "spades", value: "4", rule: "Categoria! Escolha um tema, cada um fala algo relacionado ou bebe!", icon: Sparkles },
  
  // 3
  { suit: "hearts", value: "3", rule: "Você bebe!", icon: Beer },
  { suit: "diamonds", value: "3", rule: "Você bebe!", icon: Beer },
  { suit: "clubs", value: "3", rule: "Você bebe!", icon: Beer },
  { suit: "spades", value: "3", rule: "Você bebe!", icon: Beer },
  
  // 2
  { suit: "hearts", value: "2", rule: "Escolha alguém para beber!", icon: Target },
  { suit: "diamonds", value: "2", rule: "Escolha alguém para beber!", icon: Target },
  { suit: "clubs", value: "2", rule: "Escolha alguém para beber!", icon: Target },
  { suit: "spades", value: "2", rule: "Escolha alguém para beber!", icon: Target },
];
