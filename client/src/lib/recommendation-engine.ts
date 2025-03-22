import { UserProfile } from "@shared/schema";
import { games } from "./game-data";

// Tipos para o mecanismo de recomendação
export interface GameRecommendation {
  id: string;
  name: string;
  description: string;
  route: string;
  matchScore: number; // 0-100, sendo 100 compatibilidade perfeita
  tags: string[];
  reasonsToPlay: string[];
}

// Tags que podemos associar a cada jogo
export type GameTag = 
  | 'álcool'
  | 'não-alcoólico' 
  | 'social' 
  | 'dinâmico' 
  | 'estratégia' 
  | 'sorte' 
  | 'conhecimento' 
  | 'casual' 
  | 'intenso'
  | 'para-casais'
  | 'para-grupos'
  | 'rápido'
  | 'longo'
  | 'piadas'
  | 'embaraçoso'
  | 'físico'
  | 'difícil'
  | 'fácil';

// Definição de características de cada jogo para recomendação
interface GameMetadata {
  id: string;
  tags: GameTag[];
  minPlayers: number;
  maxPlayers: number;
  averageDuration: number; // em minutos
  alcoholLevel: number; // 0-10, sendo 0 sem álcool e 10 beberagem intensa
  socialLevel: number; // 0-10, sendo 0 pouca interação e 10 muita interação
}

// Metadados dos jogos para o algoritmo de recomendação
const gamesMetadata: GameMetadata[] = [
  {
    id: 'classic',
    tags: ['álcool', 'social', 'casual', 'para-grupos', 'rápido'],
    minPlayers: 2,
    maxPlayers: 10,
    averageDuration: 15,
    alcoholLevel: 5,
    socialLevel: 7
  },
  {
    id: 'roulette',
    tags: ['álcool', 'sorte', 'dinâmico', 'intenso', 'para-grupos'],
    minPlayers: 2,
    maxPlayers: 8,
    averageDuration: 20,
    alcoholLevel: 8,
    socialLevel: 6
  },
  {
    id: 'truth-or-dare',
    tags: ['social', 'embaraçoso', 'para-grupos', 'para-casais', 'piadas'],
    minPlayers: 2,
    maxPlayers: 15,
    averageDuration: 30,
    alcoholLevel: 3,
    socialLevel: 9
  },
  {
    id: 'spin-bottle',
    tags: ['álcool', 'sorte', 'social', 'casual', 'rápido'],
    minPlayers: 3,
    maxPlayers: 10,
    averageDuration: 10,
    alcoholLevel: 6,
    socialLevel: 8
  },
  {
    id: 'cards',
    tags: ['álcool', 'estratégia', 'dinâmico', 'social', 'regras'],
    minPlayers: 2,
    maxPlayers: 10,
    averageDuration: 25,
    alcoholLevel: 7,
    socialLevel: 5
  },
  {
    id: 'coin-flip',
    tags: ['sorte', 'rápido', 'casual', 'fácil'],
    minPlayers: 2,
    maxPlayers: 6,
    averageDuration: 5,
    alcoholLevel: 2,
    socialLevel: 4
  },
  {
    id: 'guess-who',
    tags: ['conhecimento', 'social', 'estratégia', 'para-grupos'],
    minPlayers: 3,
    maxPlayers: 12,
    averageDuration: 15,
    alcoholLevel: 3,
    socialLevel: 8
  },
  {
    id: 'touch-game',
    tags: ['físico', 'dinâmico', 'para-casais', 'para-grupos', 'social'],
    minPlayers: 2,
    maxPlayers: 6,
    averageDuration: 10,
    alcoholLevel: 4,
    socialLevel: 9
  }
];

// Função para gerar mensagens personalizadas sobre por que jogar
function generateReasonsToPlay(
  gameId: string, 
  userProfile: UserProfile
): string[] {
  const reasons: string[] = [];
  const game = gamesMetadata.find(g => g.id === gameId);
  
  if (!game) return [];
  
  // Razões baseadas no gênero do usuário
  if (userProfile.gender === 'homem' && game.tags.includes('físico')) {
    reasons.push('Este jogo tem elementos físicos que costumam agradar jogadores masculinos.');
  }
  
  if (userProfile.gender === 'mulher' && game.tags.includes('social')) {
    reasons.push('Este jogo tem forte componente social, perfeito para seu perfil.');
  }
  
  // Razões baseadas na rede social favorita
  if (userProfile.favoriteSocialNetwork === 'instagram' && game.tags.includes('visual')) {
    reasons.push('Como usuário de Instagram, você vai curtir os elementos visuais deste jogo.');
  }
  
  if (userProfile.favoriteSocialNetwork === 'tiktok' && game.tags.includes('dinâmico')) {
    reasons.push('Este jogo é dinâmico e divertido, combinando com seu perfil de TikTok.');
  }
  
  // Razões baseadas nas bebidas favoritas
  const alcoholicDrinks = userProfile.favoriteDrinks.filter(drink => 
    ['cerveja', 'vinho', 'vodka', 'whisky', 'tequila', 'gin'].includes(drink)
  );
  
  if (alcoholicDrinks.length > 0 && game.alcoholLevel > 5) {
    reasons.push(`Como apreciador de ${alcoholicDrinks.join(' e ')}, este jogo tem o nível certo de diversão alcoólica para você.`);
  }
  
  if (userProfile.favoriteDrinks.includes('água') && game.alcoholLevel < 5) {
    reasons.push('Este jogo tem menor foco em álcool, o que combina com seu perfil.');
  }
  
  // Adicionar razões gerais se tivermos poucas razões específicas
  if (reasons.length < 2) {
    if (game.tags.includes('para-grupos')) {
      reasons.push('Ótimo para jogar com vários amigos!');
    }
    
    if (game.tags.includes('rápido')) {
      reasons.push('Partidas rápidas e dinâmicas, perfeitas para qualquer ocasião.');
    }
    
    if (game.tags.includes('casual')) {
      reasons.push('Fácil de aprender e jogar, mesmo sem experiência prévia.');
    }
    
    if (game.tags.includes('estratégia')) {
      reasons.push('Tem elementos estratégicos que tornam cada partida única.');
    }
  }
  
  // Garantir que temos pelo menos 2 razões
  if (reasons.length < 2) {
    reasons.push('Este jogo é bem avaliado por usuários com perfil similar ao seu!');
    reasons.push('Combina com o seu estilo de diversão baseado no seu histórico.');
  }
  
  return reasons;
}

// Função para calcular a pontuação de compatibilidade entre perfil e jogo
function calculateMatchScore(
  game: GameMetadata,
  userProfile: UserProfile
): number {
  let score = 50; // Pontuação inicial média
  
  // Ajustes baseados em bebidas favoritas
  const alcoholicDrinks = userProfile.favoriteDrinks.filter(drink => 
    ['cerveja', 'vinho', 'vodka', 'whisky', 'tequila', 'gin'].includes(drink)
  );
  
  // Se usuário gosta de bebidas alcoólicas e o jogo tem álcool
  if (alcoholicDrinks.length > 0) {
    // Quanto mais próximo o nível de álcool do jogo for de: (número de bebidas alcoólicas * 2.5)
    // mais pontos ele ganha (máximo de 20 pontos)
    const idealAlcoholLevel = Math.min(alcoholicDrinks.length * 2.5, 10);
    const alcoholDifference = Math.abs(game.alcoholLevel - idealAlcoholLevel);
    score += 20 - (alcoholDifference * 4); // 20 pontos - (0-20 pontos de penalidade)
  } else {
    // Se não gosta de bebidas alcoólicas, prefere jogos com menos álcool
    score += 20 - (game.alcoholLevel * 2); // 20 pontos - (0-20 pontos de penalidade)
  }
  
  // Ajustes baseados em rede social favorita
  switch (userProfile.favoriteSocialNetwork) {
    case 'instagram':
      // Instagram = visual, aprecia jogos sociais
      if (game.tags.includes('social')) score += 10;
      if (game.socialLevel > 7) score += 5;
      break;
    case 'tiktok':
      // TikTok = ritmo, dinâmico, rápido
      if (game.tags.includes('dinâmico')) score += 10;
      if (game.tags.includes('rápido')) score += 10;
      break;
    case 'X':
      // Twitter = discussão, estratégia
      if (game.tags.includes('estratégia')) score += 15;
      if (game.tags.includes('conhecimento')) score += 5;
      break;
    case 'facebook':
      // Facebook = social, grupos
      if (game.tags.includes('para-grupos')) score += 10;
      if (game.socialLevel > 6) score += 10;
      break;
  }
  
  // Ajustes baseados no gênero
  if (userProfile.gender === 'homem') {
    if (game.tags.includes('estratégia')) score += 5;
    if (game.tags.includes('físico')) score += 5;
    if (game.alcoholLevel > 5) score += 5; // estatisticamente, homens preferem jogos mais alcoólicos
  } else if (userProfile.gender === 'mulher') {
    if (game.tags.includes('social')) score += 7;
    if (game.tags.includes('conhecimento')) score += 5;
    if (game.socialLevel > 7) score += 5;
  }
  
  // Garantir que a pontuação esteja entre 0 e 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Função principal que gera recomendações personalizadas
export function generateRecommendations(
  userProfile: UserProfile
): GameRecommendation[] {
  // Pegar todos os jogos disponíveis
  const allGames = games.map(game => {
    const metadata = gamesMetadata.find(g => g.id === game.id) || {
      id: game.id,
      tags: ['casual'],
      minPlayers: 2,
      maxPlayers: 6,
      averageDuration: 15,
      alcoholLevel: 5,
      socialLevel: 5
    };
    
    // Calcular pontuação de compatibilidade
    const matchScore = calculateMatchScore(metadata, userProfile);
    
    // Gerar razões para jogar
    const reasonsToPlay = generateReasonsToPlay(game.id, userProfile);
    
    return {
      id: game.id,
      name: game.name,
      description: game.description,
      route: game.route,
      matchScore,
      tags: metadata.tags,
      reasonsToPlay
    };
  });
  
  // Ordenar por pontuação de compatibilidade (maior para menor)
  return allGames.sort((a, b) => b.matchScore - a.matchScore);
}

// Função para obter as melhores recomendações
export function getTopRecommendations(
  userProfile: UserProfile,
  count: number = 3
): GameRecommendation[] {
  const allRecommendations = generateRecommendations(userProfile);
  return allRecommendations.slice(0, count);
}

// Função para obter uma recomendação específica
export function getGameRecommendation(
  gameId: string,
  userProfile: UserProfile
): GameRecommendation | null {
  const allRecommendations = generateRecommendations(userProfile);
  return allRecommendations.find(game => game.id === gameId) || null;
}