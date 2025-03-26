import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SplashScreen } from "@/components/SplashScreen";

// Pages
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Stats from "@/pages/stats";
import GameModes from "@/pages/game-modes";
import Admin from "@/pages/admin";
import BannerManagement from "@/pages/banner-management";
import AdminGeoTest from "@/pages/admin-geo-test";
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
import EuNuncaRedirect from "@/pages/eu-nunca";
import EuNuncaCategorias from "@/pages/eu-nunca/categorias";
import EuNuncaJogadores from "@/pages/eu-nunca/jogadores";
import EuNuncaJogo from "@/pages/eu-nunca/jogo";
import GuessWhoPlayers from "@/pages/guess-who-players";
import GuessWhoTheme from "@/pages/guess-who-theme";
import GuessWhoGame from "@/pages/guess-who-game";
import Profile from "@/pages/profile";
import Onboarding from "@/pages/onboarding";
import Recommendations from "@/pages/recommendations";
import DesenhaEBebe from "@/pages/desenha-e-bebe";
import EuNunca from "@/pages/eu-nunca";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Route path="/auth" component={Auth} />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashScreen} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/stats">
        <ProtectedRoute component={Stats} />
      </Route>
      <Route path="/game-modes">
        <ProtectedRoute component={GameModes} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={Admin} />
      </Route>
      <Route path="/admin/banners">
        <ProtectedRoute component={BannerManagement} />
      </Route>
      <Route path="/admin/geo-test">
        <ProtectedRoute component={AdminGeoTest} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/recommendations">
        <ProtectedRoute component={Recommendations} />
      </Route>
      <Route path="/classic">
        <ProtectedRoute component={ClassicStart} />
      </Route>
      <Route path="/classic/players">
        <ProtectedRoute component={ClassicPlayers} />
      </Route>
      <Route path="/classic/play">
        <ProtectedRoute component={ClassicMode} />
      </Route>
      <Route path="/roulette/start">
        <ProtectedRoute component={RouletteStart} />
      </Route>
      <Route path="/roulette/players">
        <ProtectedRoute component={RoulettePlayers} />
      </Route>
      <Route path="/roulette/play">
        <ProtectedRoute component={RouletteMode} />
      </Route>
      <Route path="/roulette/winner">
        <ProtectedRoute component={RouletteWinner} />
      </Route>
      <Route path="/truth-or-dare">
        <ProtectedRoute component={TruthOrDare} />
      </Route>
      <Route path="/manage-players">
        <ProtectedRoute component={ManagePlayers} />
      </Route>
      <Route path="/touch-game">
        <ProtectedRoute component={TouchGame} />
      </Route>
      <Route path="/spin-bottle">
        <ProtectedRoute component={SpinBottle} />
      </Route>
      <Route path="/coin-flip">
        <ProtectedRoute component={CoinFlip} />
      </Route>
      <Route path="/cards">
        <ProtectedRoute component={Cards} />
      </Route>
      <Route path="/guess-who/players">
        <ProtectedRoute component={GuessWhoPlayers} />
      </Route>
      <Route path="/guess-who/theme">
        <ProtectedRoute component={GuessWhoTheme} />
      </Route>
      <Route path="/guess-who/play">
        <ProtectedRoute component={GuessWhoGame} />
      </Route>
      <Route path="/desenha-e-bebe">
        <ProtectedRoute component={DesenhaEBebe} />
      </Route>
      <Route path="/eu-nunca">
        <ProtectedRoute component={EuNuncaRedirect} />
      </Route>
      <Route path="/eu-nunca/categorias">
        <ProtectedRoute component={EuNuncaCategorias} />
      </Route>
      <Route path="/eu-nunca/jogadores">
        <ProtectedRoute component={EuNuncaJogadores} />
      </Route>
      <Route path="/eu-nunca/jogo">
        <ProtectedRoute component={EuNuncaJogo} />
      </Route>
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