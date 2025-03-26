import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface InstallAppPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallAppPrompt({ open, onOpenChange }: InstallAppPromptProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const isMobile = useIsMobile();

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

  const handleDismiss = () => {
    // Salvar no localStorage que o popup foi dispensado hoje
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    localStorage.setItem('installPromptDismissed', today);
    onOpenChange(false);
  };

  // Se não for um dispositivo móvel, não mostrar o popup
  if (!isMobile) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-purple-900">Adicione o Gorf à sua tela inicial!</DialogTitle>
          <DialogDescription className="text-center">
            Para uma experiência melhor, adicione nosso app à sua tela inicial e acesse sem precisar abrir o navegador.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-4 pb-2">
          {platform === "ios" && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Como adicionar no iPhone/iPad:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Toque no ícone <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-300 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10V14M8 7V17M12 4V20M16 7V17M19 10V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> ou <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-300 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12H16M8 12C6.89543 12 6 11.1046 6 10C6 8.89543 6.89543 8 8 8H16C17.1046 8 18 8.89543 18 10C18 11.1046 17.1046 12 16 12M8 12C6.89543 12 6 12.8954 6 14C6 15.1046 6.89543 16 8 16H16C17.1046 16 18 15.1046 18 14C18 12.8954 17.1046 12 16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> na barra de ferramentas do Safari.</li>
                  <li>Role para baixo e toque em "Adicionar à tela de início".</li>
                  <li>Confirme tocando em "Adicionar" no canto superior direito.</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img src="/api/images/add-to-homescreen-ios.png" alt="Instruções iOS" className="h-32 object-contain" />
              </div>
            </div>
          )}

          {platform === "android" && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 text-sm">
                <p className="font-medium mb-2">Como adicionar no Android:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Toque no ícone de menu <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-300 rounded-md mx-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12C18 11.4477 18.4477 11 19 11C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13C18.4477 13 18 12.5523 18 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span> no seu navegador.</li>
                  <li>Selecione "Instalar aplicativo" ou "Adicionar à tela inicial".</li>
                  <li>Confirme a instalação.</li>
                </ol>
              </div>
              <div className="flex justify-center">
                <img src="/api/images/add-to-homescreen-android.png" alt="Instruções Android" className="h-32 object-contain" />
              </div>
            </div>
          )}

          {platform === "other" && (
            <div className="bg-gray-100 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Como adicionar à tela inicial:</p>
              <p>Abra este site em um dispositivo móvel (iPhone ou Android) para ver instruções detalhadas de instalação.</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
            Lembrar mais tarde
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