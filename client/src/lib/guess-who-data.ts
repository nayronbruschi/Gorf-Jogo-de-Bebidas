import { shuffle } from "@/lib/utils";

export const themes = [
  { id: "animals", name: "Animais" },
  { id: "characters", name: "Personagens" },
  { id: "movies", name: "Filmes" },
  { id: "places", name: "Locais" },
  { id: "objects", name: "Objetos" },
  { id: "famous", name: "Famosos" }
] as const;

export type ThemeId = typeof themes[number]["id"];

export interface GuessItem {
  id: string;
  name: string;
  theme: ThemeId;
}

export const items: GuessItem[] = [
  // Animais
  { id: "lion", name: "Leão", theme: "animals" },
  { id: "elephant", name: "Elefante", theme: "animals" },
  { id: "giraffe", name: "Girafa", theme: "animals" },
  { id: "penguin", name: "Pinguim", theme: "animals" },
  { id: "dolphin", name: "Golfinho", theme: "animals" },
  { id: "monkey", name: "Macaco", theme: "animals" },
  { id: "tiger", name: "Tigre", theme: "animals" },
  { id: "panda", name: "Panda", theme: "animals" },
  { id: "koala", name: "Coala", theme: "animals" },
  { id: "kangaroo", name: "Canguru", theme: "animals" },

  // Personagens
  { id: "mario", name: "Mario", theme: "characters" },
  { id: "spiderman", name: "Homem-Aranha", theme: "characters" },
  { id: "batman", name: "Batman", theme: "characters" },
  { id: "wonderwoman", name: "Mulher Maravilha", theme: "characters" },
  { id: "mickey", name: "Mickey Mouse", theme: "characters" },
  { id: "pikachu", name: "Pikachu", theme: "characters" },
  { id: "sonic", name: "Sonic", theme: "characters" },
  { id: "elsa", name: "Elsa", theme: "characters" },
  { id: "ironman", name: "Homem de Ferro", theme: "characters" },
  { id: "superman", name: "Superman", theme: "characters" },

  // Filmes
  { id: "titanic", name: "Titanic", theme: "movies" },
  { id: "starwars", name: "Star Wars", theme: "movies" },
  { id: "avatar", name: "Avatar", theme: "movies" },
  { id: "frozen", name: "Frozen", theme: "movies" },
  { id: "matrix", name: "Matrix", theme: "movies" },
  { id: "jurassicpark", name: "Jurassic Park", theme: "movies" },
  { id: "toystory", name: "Toy Story", theme: "movies" },
  { id: "lionking", name: "O Rei Leão", theme: "movies" },
  { id: "harrypotter", name: "Harry Potter", theme: "movies" },
  { id: "avengers", name: "Os Vingadores", theme: "movies" },

  // Locais
  { id: "paris", name: "Paris", theme: "places" },
  { id: "nyc", name: "Nova York", theme: "places" },
  { id: "rio", name: "Rio de Janeiro", theme: "places" },
  { id: "tokyo", name: "Tóquio", theme: "places" },
  { id: "venice", name: "Veneza", theme: "places" },
  { id: "pyramids", name: "Pirâmides do Egito", theme: "places" },
  { id: "tajmahal", name: "Taj Mahal", theme: "places" },
  { id: "london", name: "Londres", theme: "places" },
  { id: "rome", name: "Roma", theme: "places" },
  { id: "greatwall", name: "Muralha da China", theme: "places" },

  // Objetos
  { id: "phone", name: "Telefone", theme: "objects" },
  { id: "chair", name: "Cadeira", theme: "objects" },
  { id: "tv", name: "Televisão", theme: "objects" },
  { id: "book", name: "Livro", theme: "objects" },
  { id: "car", name: "Carro", theme: "objects" },
  { id: "computer", name: "Computador", theme: "objects" },
  { id: "watch", name: "Relógio", theme: "objects" },
  { id: "guitar", name: "Violão", theme: "objects" },
  { id: "camera", name: "Câmera", theme: "objects" },
  { id: "umbrella", name: "Guarda-chuva", theme: "objects" },

  // Famosos
  { id: "neymar", name: "Neymar", theme: "famous" },
  { id: "madonna", name: "Madonna", theme: "famous" },
  { id: "einstein", name: "Einstein", theme: "famous" },
  { id: "michaeljackson", name: "Michael Jackson", theme: "famous" },
  { id: "shakespeare", name: "Shakespeare", theme: "famous" },
  { id: "chaplin", name: "Charlie Chaplin", theme: "famous" },
  { id: "beethoven", name: "Beethoven", theme: "famous" },
  { id: "picasso", name: "Picasso", theme: "famous" },
  { id: "elvis", name: "Elvis Presley", theme: "famous" },
  { id: "mandela", name: "Nelson Mandela", theme: "famous" }
];

export function getItemsByTheme(themeId: ThemeId): GuessItem[] {
  return shuffle(items.filter(item => item.theme === themeId));
}
