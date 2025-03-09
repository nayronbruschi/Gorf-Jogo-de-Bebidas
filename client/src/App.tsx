import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ClassicMode from "@/pages/classic-mode";
import RouletteMode from "@/pages/roulette-mode";
import TruthOrDare from "@/pages/truth-or-dare";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/classic" component={ClassicMode} />
      <Route path="/roulette" component={RouletteMode} />
      <Route path="/truth-or-dare" component={TruthOrDare} />
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
