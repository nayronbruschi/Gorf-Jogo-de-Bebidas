import { useEffect } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { auth } from "@/lib/firebase";
import { BannerUploader } from "@/components/BannerUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Admin() {
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
        <h1 className="text-2xl font-bold text-white mb-8">Administração</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BannerUploader />
        </div>
      </div>
    </AppLayout>
  );
}
