import { useEffect } from "react";
import { useLocation } from "wouter";

export default function EuNuncaRedirect() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    navigate("/eu-nunca/categorias");
  }, [navigate]);

  return null;
}