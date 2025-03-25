import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, Sparkles, ThumbsUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getTopRecommendations, GameRecommendation } from "@/lib/recommendation-engine";
import { getUserProfile } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@shared/schema";

interface GameRecommendationCardProps {
  className?: string;
}

export function GameRecommendationCard({ className }: GameRecommendationCardProps) {
  const [recommendation, setRecommendation] = useState<GameRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    async function loadRecommendation() {
      try {
        // Verificar se temos usuário autenticado
        const userId = auth.currentUser?.uid || localStorage.getItem('dev_session');
        
        if (!userId) {
          console.error("Nenhum usuário autenticado encontrado");
          setLoading(false);
          return;
        }

        // Verificar se já temos o perfil em cache
        const profile = await getUserProfile(userId as string);
        
        if (!profile) {
          console.error("Perfil de usuário não encontrado");
          setLoading(false);
          return;
        }
        
        setUserProfile(profile);
        
        // Obter a melhor recomendação
        const topRecommendations = getTopRecommendations(profile, 1);
        if (topRecommendations.length > 0) {
          setRecommendation(topRecommendations[0]);
        }
      } catch (error) {
        console.error("Erro ao carregar recomendação:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadRecommendation();
  }, [toast]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">Jogo Recomendado</CardTitle>
          <CardDescription className="text-gray-700">Complete seu perfil para receber recomendações</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-4">
          <p className="text-gray-700">
            Não foi possível gerar uma recomendação personalizada ainda.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white" asChild>
            <Link href="/profile">Completar Perfil</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="bg-gradient-to-r from-purple-700 to-blue-600 text-white pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
            <CardTitle className="text-lg font-bold">Jogo Recomendado</CardTitle>
          </div>
          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium">
            {recommendation.matchScore}% match
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{recommendation.name}</h3>
            <p className="text-gray-700 text-sm mt-1 line-clamp-2">{recommendation.description}</p>
          </div>
          
          {recommendation.reasonsToPlay.length > 0 && (
            <div className="flex items-start">
              <ThumbsUp className="h-4 w-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-800">{recommendation.reasonsToPlay[0]}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 pt-1">
            {recommendation.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs bg-purple-100 text-purple-800">{tag}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 pb-3">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50" asChild>
            <Link href="/recommendations">
              Ver mais
            </Link>
          </Button>
          
          <Button size="sm" className="bg-purple-700 hover:bg-purple-800 text-white" asChild>
            <Link href={recommendation.route}>
              Jogar <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}