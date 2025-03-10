import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GameModes from "@/pages/game-modes";
import ClassicStart from "@/pages/classic-start";
import ClassicPlayers from "@/pages/classic-players";
import ClassicMode from "@/pages/classic-mode";
import RouletteStart from "@/pages/roulette-start";
import RoulettePlayers from "@/pages/roulette-players";
import RouletteMode from "@/pages/roulette-mode";
import RouletteWinner from "@/pages/roulette-winner";
import TruthOrDare from "@/pages/truth-or-dare";
import ManagePlayers from "@/pages/manage-players";
import TouchGame from "@/pages/touch-game";
import SpinBottle from "@/pages/spin-bottle";
import CoinFlip from "@/pages/coin-flip";
import Cards from "@/pages/cards";
import GuessWhoPlayers from "@/pages/guess-who-players";
import GuessWhoTheme from "@/pages/guess-who-theme";
import GuessWhoGame from "@/pages/guess-who-game";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game-modes" component={GameModes} />
      <Route path="/classic" component={ClassicStart} />
      <Route path="/classic/players" component={ClassicPlayers} />
      <Route path="/classic/play" component={ClassicMode} />
      <Route path="/roulette" component={RouletteStart} />
      <Route path="/roulette/players" component={RoulettePlayers} />
      <Route path="/roulette/play" component={RouletteMode} />
      <Route path="/roulette/winner" component={RouletteWinner} />
      <Route path="/truth-or-dare" component={TruthOrDare} />
      <Route path="/manage-players" component={ManagePlayers} />
      <Route path="/touch-game" component={TouchGame} />
      <Route path="/spin-bottle" component={SpinBottle} />
      <Route path="/coin-flip" component={CoinFlip} />
      <Route path="/cards" component={Cards} />
      {/* Novas rotas do Guess Who */}
      <Route path="/guess-who/players" component={GuessWhoPlayers} />
      <Route path="/guess-who/theme" component={GuessWhoTheme} />
      <Route path="/guess-who/play" component={GuessWhoGame} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;