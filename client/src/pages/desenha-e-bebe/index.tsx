import { useEffect } from "react";
import { useLocation } from "wouter";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function DesenhaEBebeRedirect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Redirecionar para a página de jogadores
    navigate("/desenha-e-bebe/jogadores");
  }, [navigate]);
  
  return <LoadingScreen />;
}