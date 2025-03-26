import { useEffect } from "react";
import { useLocation } from "wouter";

export default function DesenhaEBebeRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/desenha-e-bebe/jogadores");
  }, [navigate]);

  return null;
}