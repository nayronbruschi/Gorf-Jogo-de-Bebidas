import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Stats from "@/pages/stats";
import GameModes from "@/pages/game-modes";
import Admin from "@/pages/admin";
import Onboarding from "@/pages/onboarding"; 
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
import Profile from "@/pages/profile";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (window.location.pathname !== "/auth") {
      window.location.href = "/auth";
    }
    return null;
  }

  // Verificar se precisa de onboarding, exceto na própria página de onboarding
  const needsOnboarding = !profile?.name || !profile?.birthDate || !profile?.gender || !profile?.favoriteSocialNetwork;
  const isOnboardingPage = window.location.pathname === "/onboarding";

  if (needsOnboarding && !isOnboardingPage) {
    window.location.href = "/onboarding";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/auth" component={Auth} />
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>
      {/* Outras rotas protegidas */}
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
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
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
      <Route path="/roulette">
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