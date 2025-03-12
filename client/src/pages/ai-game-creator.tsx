import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { generateGameRules, type GameRules } from "@/lib/openai-service";
import { useToast } from "@/hooks/use-toast";

export default function AIGameCreator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<GameRules | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, descreva o tipo de jogo que você quer criar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      const rules = await generateGameRules(prompt);
      setGeneratedGame(rules);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Criar Jogo com IA</h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none">
          <CardHeader>
            <CardTitle className="text-white">Descreva seu jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Ex: Um jogo divertido para 4-6 pessoas que envolva cartas e seja fácil de aprender..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-white/10 border-white/20 text-white min-h-[100px]"
            />
            <Button
              onClick={handleGenerate}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Gerar Regras"
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedGame && (
          <Card className="bg-white/10 backdrop-blur-lg border-none">
            <CardHeader>
              <CardTitle className="text-white">{generatedGame.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-white/60 mb-2">Descrição</h3>
                <p className="text-white">{generatedGame.description}</p>
              </div>

              <div>
                <h3 className="text-white/60 mb-2">Jogadores</h3>
                <p className="text-white">
                  {generatedGame.players.min} - {generatedGame.players.max} jogadores
                </p>
              </div>

              <div>
                <h3 className="text-white/60 mb-2">Duração</h3>
                <p className="text-white">{generatedGame.duration}</p>
              </div>

              <div>
                <h3 className="text-white/60 mb-2">Materiais Necessários</h3>
                <ul className="list-disc list-inside text-white space-y-1">
                  {generatedGame.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-white/60 mb-2">Regras</h3>
                <ol className="list-decimal list-inside text-white space-y-2">
                  {generatedGame.rules.map((rule, index) => (
                    <li key={index}>{rule}</li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
