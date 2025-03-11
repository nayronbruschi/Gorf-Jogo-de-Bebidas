import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { BannerUploader } from "@/components/BannerUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "nayroncbruschi@gmail.com" && password === "#Nayron@1996!") {
      setIsAuthenticated(true);
      toast({
        title: "Login bem sucedido",
        description: "Bem-vindo à área administrativa",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="container mx-auto p-4 max-w-md">
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">Login Administrativo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
                <Button type="submit" className="w-full">
                  Entrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold text-white mb-8">Administração</h1>

        <div className="grid grid-cols-1 gap-8">
          <BannerUploader />
        </div>
      </div>
    </AppLayout>
  );
}