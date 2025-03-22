import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getTopRecommendations, GameRecommendation } from "@/lib/recommendation-engine";
import { getUserProfile } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { Link } from "wouter";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@shared/schema";
import { Sparkles, Trophy, ThumbsUp, ArrowRight, Star } from "lucide-react";

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        // Verificar se temos usuário autenticado
        const userId = auth.currentUser?.uid || localStorage.getItem('dev_session');
        
        if (!userId) {
          console.error("Nenhum usuário autenticado encontrado");
          setLoading(false);
          return;
        }

        // Obter perfil do usuário
        const profile = await getUserProfile(userId as string);
        
        if (!profile) {
          console.error("Perfil de usuário não encontrado");
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar seu perfil. Por favor, complete seu cadastro."
          });
          setLoading(false);
          return;
        }
        
        setUserProfile(profile);
        
        // Gerar recomendações com base no perfil
        const recommendations = getTopRecommendations(profile, 5);
        setRecommendations(recommendations);
      } catch (error) {
        console.error("Erro ao carregar recomendações:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as recomendações. Tente novamente mais tarde."
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadRecommendations();
  }, [toast]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppLayout>
      <div className="container max-w-screen-md mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">Jogos Recomendados</h1>
            <Sparkles className="ml-2 h-6 w-6 text-yellow-400" />
          </div>
          
          <p className="text-muted-foreground">
            Jogos escolhidos especialmente para você com base no seu perfil e histórico.
          </p>
        </div>

        <Separator className="my-6" />

        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Trophy className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium">Nenhuma recomendação ainda</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Complete seu perfil e jogue mais jogos para recebermos mais informações sobre suas preferências.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/profile">
                Completar Perfil
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TOP RECOMMENDATION */}
            {recommendations.length > 0 && (
              <Card className="border-2 border-yellow-400 overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 rounded-bl-lg font-medium text-sm flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-black" />
                  {recommendations[0].matchScore}% de compatibilidade
                </div>
                
                <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-500 text-white">
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-yellow-300" />
                    <CardTitle>Jogo Ideal para Você</CardTitle>
                  </div>
                  <CardDescription className="text-purple-100">
                    Compatibilidade máxima com seu perfil
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold">{recommendations[0].name}</h3>
                      <p className="text-muted-foreground">{recommendations[0].description}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm uppercase text-muted-foreground">Por que jogar:</h4>
                      <ul className="space-y-2">
                        {recommendations[0].reasonsToPlay.map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <ThumbsUp className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recommendations[0].tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50 border-t">
                  <Button className="w-full" asChild>
                    <Link href={recommendations[0].route}>
                      Jogar Agora <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {/* OTHER RECOMMENDATIONS */}
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.slice(1).map((game) => (
                <Card key={game.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <Badge variant="outline" className="ml-2 bg-purple-50">
                        {game.matchScore}%
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">{game.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {game.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {game.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{game.tags.length - 3}</Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Por que jogar: </span>
                      {game.reasonsToPlay[0]}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 border-t">
                    <Button variant="ghost" className="w-full" asChild>
                      <Link href={game.route}>
                        Jogar <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}