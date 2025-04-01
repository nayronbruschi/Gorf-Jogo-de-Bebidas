import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Plus, Smartphone } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { InstallPromptConfig } from "../../../shared/schema";
import { useToast } from "@/hooks/use-toast";

interface InstallAppPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppPrompt({ open, onOpenChange }: InstallAppPromptProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [showPrompt, setShowPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Referência para armazenar o evento beforeinstallprompt
  const deferredPrompt = useRef<any>(null);
  
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

  // Detectar suporte à instalação PWA
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir o comportamento padrão
      e.preventDefault();
      // Armazenar o evento para uso posterior
      deferredPrompt.current = e;
      // Indicar que o app pode ser instalado
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

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
  
  // Função para instalar o app (apenas Android)
  const handleInstallClick = async () => {
    if (!deferredPrompt.current) {
      toast({
        title: "Instalação indisponível",
        description: "Seu navegador não suporta instalação automática. Siga as instruções manuais.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Mostrar o prompt de instalação
      deferredPrompt.current.prompt();
      // Aguardar resposta do usuário
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: "Gorf instalado!",
          description: "O app foi adicionado à sua tela inicial com sucesso.",
          variant: "default",
        });
        onOpenChange(false);
      }
      
      // Limpar a referência
      deferredPrompt.current = null;
      setCanInstall(false);
    } catch (error) {
      console.error('Erro ao instalar o app:', error);
      toast({
        title: "Erro na instalação",
        description: "Houve um problema. Tente instalar manualmente seguindo as instruções.",
        variant: "destructive",
      });
    }
  };

  // Se não for um dispositivo móvel ou não deve mostrar o popup, não renderizar
  if (!isMobile || !showPrompt) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[320px] max-h-[80vh] overflow-y-auto rounded-xl border-slate-200 shadow-lg bg-white">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-center text-lg font-bold text-gorf-purple">Adicione à tela inicial!</DialogTitle>
          <DialogDescription className="text-center text-slate-600 text-sm">
            Acesse o Gorf diretamente com apenas um toque
          </DialogDescription>
        </DialogHeader>

        <div className="pt-1 pb-1">
          {platform === "ios" && (
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-800 border border-slate-200">
                <p className="font-medium text-gorf-purple mb-1">No iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Toque no ícone <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-200 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10V14M8 7V17M12 4V20M16 7V17M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> na barra do Safari</li>
                  <li>Role e toque em "Adicionar à tela inicial"</li>
                  <li>Confirme tocando em "Adicionar"</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img
                  src="/add-to-homescreen-ios.svg"
                  alt="Instruções iOS"
                  className="h-32 object-contain"
                />
              </div>
            </div>
          )}

          {platform === "android" && (
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-800 border border-slate-200">
                <p className="font-medium text-gorf-purple mb-1">No Android:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Toque no menu <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-200 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> do navegador</li>
                  <li>Selecione "Instalar aplicativo"</li>
                  <li>Confirme a instalação</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img
                  src="/add-to-homescreen-android.svg"
                  alt="Instruções Android"
                  className="h-32 object-contain"
                />
              </div>
              
              {canInstall && (
                <Button 
                  className="w-full bg-gorf-purple hover:bg-purple-900 text-white rounded-xl" 
                  onClick={handleInstallClick}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Instalar automaticamente
                </Button>
              )}
            </div>
          )}

          {platform === "other" && (
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-800 border border-slate-200">
              <p className="font-medium text-gorf-purple mb-1">Como adicionar:</p>
              <p className="text-xs">Abra este site em um dispositivo móvel para ver as instruções de instalação.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-row gap-2 mt-1">
          <Button variant="outline" onClick={handleDismiss} className="w-1/2 text-slate-700 text-xs rounded-xl border-slate-300">
            Mais tarde
          </Button>
          <Button className="w-1/2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-xl" onClick={handleDismiss}>
            <Plus className="mr-1 h-3 w-3" />
            Já adicionei
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}