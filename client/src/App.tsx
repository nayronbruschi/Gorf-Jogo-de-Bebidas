import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { SplashScreen } from "@/components/SplashScreen";
import { Suspense, lazy, useEffect } from "react";

// Página inicial e autenticação carregadas imediatamente
import NotFound from "@/pages/not-found";
import Auth from "@/pages/auth";
import LandingPage from "@/pages/landing-page";

// Páginas carregadas com lazy loading
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Stats = lazy(() => import("@/pages/stats"));
const GameModes = lazy(() => import("@/pages/game-modes"));
const Admin = lazy(() => import("@/pages/admin"));
const BannerManagement = lazy(() => import("@/pages/banner-management"));
const FeaturedTags = lazy(() => import("@/pages/featured-tags"));
const AdminGeoTest = lazy(() => import("@/pages/admin-geo-test"));
const ClassicStart = lazy(() => import("@/pages/classic-start"));
const ClassicPlayers = lazy(() => import("@/pages/classic-players"));
const ClassicMode = lazy(() => import("@/pages/classic-mode"));
const RouletteStart = lazy(() => import("@/pages/roulette-start"));
const RoulettePlayers = lazy(() => import("@/pages/roulette-players"));
const RouletteMode = lazy(() => import("@/pages/roulette-mode"));
const RouletteWinner = lazy(() => import("@/pages/roulette-winner"));
const TruthOrDare = lazy(() => import("@/pages/truth-or-dare"));
const ManagePlayers = lazy(() => import("@/pages/manage-players"));
const TouchGame = lazy(() => import("@/pages/touch-game"));
const SpinBottle = lazy(() => import("@/pages/spin-bottle"));
const CoinFlip = lazy(() => import("@/pages/coin-flip"));
const Cards = lazy(() => import("@/pages/cards"));
const EuNuncaRedirect = lazy(() => import("@/pages/eu-nunca"));
const EuNuncaCategorias = lazy(() => import("@/pages/eu-nunca/categorias"));
const EuNuncaJogadores = lazy(() => import("@/pages/eu-nunca/jogadores"));
const EuNuncaJogo = lazy(() => import("@/pages/eu-nunca/jogo"));
const GuessWhoPlayers = lazy(() => import("@/pages/guess-who-players"));
const GuessWhoTheme = lazy(() => import("@/pages/guess-who-theme"));
const GuessWhoGame = lazy(() => import("@/pages/guess-who-game"));
const Profile = lazy(() => import("@/pages/profile"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Recommendations = lazy(() => import("@/pages/recommendations"));
const DesenhaEBebe = lazy(() => import("@/pages/desenha-e-bebe"));
const EuNunca = lazy(() => import("@/pages/eu-nunca"));
const InstallPromptSettings = lazy(() => import("@/pages/install-prompt-settings"));
const QualMeuNome = lazy(() => import("@/pages/QualMeuNome"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirecionar para a página de login quando não estiver autenticado
      setLocation("/auth");
    }
  }, [isAuthenticated, loading, setLocation]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Auth} />
      <Route path="/splash" component={SplashScreen} />
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
      <Route path="/admin/featured-tags">
        <ProtectedRoute component={FeaturedTags} />
      </Route>
      <Route path="/admin/geo-test">
        <ProtectedRoute component={AdminGeoTest} />
      </Route>
      <Route path="/admin/install-prompt">
        <ProtectedRoute component={InstallPromptSettings} />
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
      <Route path="/qual-meu-nome">
        <ProtectedRoute component={QualMeuNome} />
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