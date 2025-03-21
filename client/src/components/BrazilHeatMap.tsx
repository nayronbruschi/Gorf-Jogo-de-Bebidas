import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Definição do contorno do Brasil
const BRASIL_GEO = { 
  latitude: -15.77972, 
  longitude: -47.92972, 
  zoom: 4 
};

interface HeatMapPoint {
  lat: number;
  lng: number;
  intensity?: number;
}

interface BrazilHeatMapProps {
  points: HeatMapPoint[];
  height?: string;
}

export function BrazilHeatMap({ points, height = "400px" }: BrazilHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    // Verificar se o mapa já foi inicializado
    if (!mapInstanceRef.current && mapRef.current) {
      // Inicializar o mapa
      const map = L.map(mapRef.current).setView(
        [BRASIL_GEO.latitude, BRASIL_GEO.longitude],
        BRASIL_GEO.zoom
      );

      // Adicionar camada de mapa base
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Salvar a instância do mapa
      mapInstanceRef.current = map;

      // Adicionar marcadores para cidades principais
      const cities = [
        { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
        { name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729 },
        { name: "Brasília", lat: -15.7801, lng: -47.9292 },
        { name: "Salvador", lat: -12.9716, lng: -38.5016 },
        { name: "Fortaleza", lat: -3.7319, lng: -38.5267 },
        { name: "Belo Horizonte", lat: -19.9167, lng: -43.9345 },
        { name: "Manaus", lat: -3.1190, lng: -60.0217 },
        { name: "Curitiba", lat: -25.4295, lng: -49.2715 },
        { name: "Recife", lat: -8.0476, lng: -34.8770 },
        { name: "Porto Alegre", lat: -30.0346, lng: -51.2177 }
      ];

      cities.forEach(city => {
        L.marker([city.lat, city.lng])
          .addTo(map)
          .bindPopup(city.name);
      });
    }

    // Atualizar a camada de calor sempre que os pontos mudarem
    if (mapInstanceRef.current) {
      // Remover a camada de calor anterior, se existir
      if (heatLayerRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
      }

      // Formatar os pontos para o formato esperado pelo Leaflet.heat
      const heatData = points.map(point => {
        return [
          point.lat, 
          point.lng, 
          point.intensity || 0.5
        ];
      });

      // Adicionar nova camada de calor
      if (heatData.length > 0) {
        // @ts-ignore - A tipagem do leaflet.heat não está correta
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 10,
          max: 1.0,
          gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'yellow',
            1.0: 'red'
          }
        }).addTo(mapInstanceRef.current);
      }
    }

    // Cleanup ao desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  return (
    <div className="rounded-lg overflow-hidden border border-purple-600/50">
      <div ref={mapRef} style={{ height, width: "100%" }} />
    </div>
  );
}