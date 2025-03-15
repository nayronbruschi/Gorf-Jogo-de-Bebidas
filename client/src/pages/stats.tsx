import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Stats() {
  const [, navigate] = useLocation();

  // Proteger rota
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white">Estatísticas</CardTitle>
            <CardDescription className="text-white/60">
              Estatísticas em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-white/60">
              Sistema de estatísticas em desenvolvimento
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}