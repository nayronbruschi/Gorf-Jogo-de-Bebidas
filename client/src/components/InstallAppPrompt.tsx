import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { InstallPromptConfig } from "../../../shared/schema";

interface InstallAppPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppPrompt({ open, onOpenChange }: InstallAppPromptProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [showPrompt, setShowPrompt] = useState(false);
  const isMobile = useIsMobile();

  // Buscar a configuração do popup
  const { data: config } = useQuery({
    queryKey: ['/api/install-prompt-config'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/install-prompt-config');
        if (!response.ok) return null;
        return response.json() as Promise<InstallPromptConfig>;
      } catch (error) {
        console.error("Erro ao buscar configuração do popup:", error);
        return null;
      }
    },
  });

  useEffect(() => {
    // Detectar a plataforma
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setPlatform("ios");
    } else if (/android/i.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("other");
    }
  }, []);

  useEffect(() => {
    // Verificar se deve mostrar o popup de acordo com a configuração e o histórico
    if (!config || !config.enabled) {
      setShowPrompt(false);
      return;
    }

    // Verificar se está dentro do período de exibição (se especificado)
    const now = new Date();
    if (config.startDate && new Date(config.startDate) > now) {
      setShowPrompt(false);
      return;
    }
    if (config.endDate && new Date(config.endDate) < now) {
      setShowPrompt(false);
      return;
    }

    // Verificar a frequência a partir do localStorage
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (lastDismissed) {
      const lastDate = new Date(lastDismissed);
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < config.frequency) {
        setShowPrompt(false);
        return;
      }
    }

    // Se chegou até aqui, deve mostrar o popup
    setShowPrompt(true);
  }, [config]);

  const handleDismiss = () => {
    // Salvar no localStorage que o popup foi dispensado hoje
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    localStorage.setItem('installPromptDismissed', today);
    onOpenChange(false);
  };

  // Se não for um dispositivo móvel ou não deve mostrar o popup, não renderizar
  if (!isMobile || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[340px] max-h-[90vh] overflow-y-auto rounded-xl border-purple-200 shadow-xl bg-gradient-to-br from-white to-purple-50">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold text-purple-900">Adicione à tela inicial!</DialogTitle>
          <DialogDescription className="text-center text-purple-800">
            Acesse o Gorf com apenas um toque, sem precisar abrir o navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2 pb-1">
          {platform === "ios" && (
            <div className="space-y-3">
              <div className="bg-white/90 border border-purple-100 rounded-lg p-3 text-sm text-purple-900 shadow-sm">
                <p className="font-medium mb-1">No iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Toque no ícone <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10V14M8 7V17M12 4V20M16 7V17M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> na barra do Safari</li>
                  <li>Role e toque em <span className="font-semibold text-purple-800">"Adicionar à tela inicial"</span></li>
                  <li>Confirme tocando em <span className="font-semibold text-purple-800">"Adicionar"</span></li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img
                  src="/add-to-homescreen-ios.svg"
                  alt="Instruções iOS"
                  className="h-36 object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {platform === "android" && (
            <div className="space-y-3">
              <div className="bg-white/90 border border-purple-100 rounded-lg p-3 text-sm text-purple-900 shadow-sm">
                <p className="font-medium mb-1">No Android:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Toque no menu <span className="inline-flex items-center justify-center w-5 h-5 bg-purple-100 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> do navegador</li>
                  <li>Selecione <span className="font-semibold text-purple-800">"Instalar aplicativo"</span></li>
                  <li>Confirme a instalação</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img
                  src="/add-to-homescreen-android.svg"
                  alt="Instruções Android"
                  className="h-36 object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          {platform === "other" && (
            <div className="bg-white/90 border border-purple-100 rounded-lg p-3 text-sm text-purple-900 shadow-sm">
              <p className="font-medium mb-1">Como adicionar:</p>
              <p>Abra este site em um dispositivo móvel para ver as instruções de instalação.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto text-purple-700 border-purple-200 hover:bg-purple-50">
            Depois
          </Button>
          <Button className="w-full sm:w-auto bg-purple-700 hover:bg-purple-800" onClick={handleDismiss}>
            <Plus className="mr-2 h-4 w-4" />
            Já adicionei
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}