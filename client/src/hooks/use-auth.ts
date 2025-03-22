import { useEffect, useState } from "react";
import { auth, getUserProfile } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

// Tipo de dados para a localização
interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const { toast } = useToast();

  // Função para obter a localização do usuário
  const getUserLocation = async (): Promise<UserLocation | null> => {
    if (!navigator.geolocation) {
      console.log("[Auth] Geolocalização não suportada pelo navegador");
      return null;
    }
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      console.log(`[Auth] Localização capturada: Lat ${latitude}, Lng ${longitude}`);
      
      // Em uma implementação real, aqui faríamos uma chamada para uma API de geocodificação reversa
      // Para transformar latitude/longitude em nome de cidade
      // Exemplo: 
      // const geocodingResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=SEU_TOKEN`);
      // const geocodingData = await geocodingResponse.json();
      // const city = geocodingData.features.find(f => f.place_type.includes('place'))?.text;
      
      return { latitude, longitude };
    } catch (error) {
      console.error("[Auth] Erro ao obter localização:", error);
      return null;
    }
  };

  // Função para salvar a localização do usuário
  const saveUserLocation = async (userId: string, location: UserLocation) => {
    // Em produção, aqui enviaríamos a localização para o Firebase ou outra API
    console.log(`[Auth] Salvando localização do usuário ${userId}:`, location);
    
    // Exemplo de como seria a implementação:
    // await updateDoc(doc(db, "users", userId), {
    //   lastLocation: {
    //     latitude: location.latitude,
    //     longitude: location.longitude,
    //     city: location.city,
    //     timestamp: serverTimestamp()
    //   }
    // });
  };

  useEffect(() => {
    console.log("[Auth] Iniciando listener de autenticação");
    
    // Ambiente de desenvolvimento - criar uma verificação mock
    const isDevelopment = window.location.hostname.includes('replit.dev') || 
                          window.location.hostname.includes('localhost');
    
    if (isDevelopment) {
      console.log("[Auth] Executando em ambiente de desenvolvimento, permitindo acesso sem Firebase");
      // Verificar se temos uma sessão de desenvolvimento no localStorage
      const mockSession = localStorage.getItem('dev_session');
      
      if (mockSession) {
        console.log("[Auth] Sessão de desenvolvimento encontrada, continuando com sessão mock");
        // Simular um usuário autenticado para desenvolvimento
        setUser({ uid: 'dev-user-id', email: 'dev@example.com' } as any);
        setIsNewUser(false);
        
        // Simular captura de localização
        setTimeout(async () => {
          const location = await getUserLocation();
          if (location) {
            setUserLocation(location);
          }
          setLoading(false);
        }, 500);
      } else {
        console.log("[Auth] Nenhuma sessão de desenvolvimento encontrada, iniciando como não autenticado");
        setLoading(false);
      }
      
      // Para ambiente de desenvolvimento, não há necessidade de cancelar inscrição
      return () => {
        console.log("[Auth] Limpando estado de desenvolvimento");
      };
    } else {
      // Código normal para produção
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        try {
          if (user) {
            console.log("[Auth] Usuário autenticado:", user.uid);
            
            // Verificar se o usuário já tem perfil
            const profile = await getUserProfile(user.uid);
            setIsNewUser(!profile);
            setUser(user);
            
            // Capturar a localização do usuário
            const location = await getUserLocation();
            if (location) {
              setUserLocation(location);
              await saveUserLocation(user.uid, location);
            }
          } else {
            console.log("[Auth] Usuário deslogado");
            setUser(null);
            setIsNewUser(false);
            setUserLocation(null);
          }
        } catch (error) {
          console.error("[Auth] Erro:", error);
          toast({
            variant: "destructive",
            title: "Erro na autenticação",
            description: "Por favor, tente fazer login novamente."
          });
        } finally {
          setLoading(false);
        }
      });

      return () => {
        console.log("[Auth] Limpando listener");
        unsubscribe();
      };
    }
  }, [toast]);

  return {
    user,
    loading,
    isNewUser,
    isAuthenticated: !!user,
    userLocation
  };
}