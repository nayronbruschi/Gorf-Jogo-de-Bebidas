import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";

export default function Profile() {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [, navigate] = useLocation();
  const user = auth.currentUser;

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card className="bg-white/10 backdrop-blur-lg border-none relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-5 w-5" />
            </Button>
            <CardHeader>
              <CardTitle className="text-2xl text-white">Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Nome</p>
                  <p className="text-white">{user.displayName || user.email?.split('@')[0] || "Usuário"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white/60">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
                <div className="text-center mt-4">
                  <p className="text-white/60">
                    Funcionalidades adicionais do perfil serão implementadas em breve.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileEditDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={null}
          onProfileUpdated={() => {}}
        />
      </div>
    </AppLayout>
  );
}