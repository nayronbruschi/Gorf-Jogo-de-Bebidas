import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ImageUploader";

export function BannerUploader() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const handleUploadComplete = (url: string) => {
    setBannerUrl(url);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-none">
      <CardHeader>
        <CardTitle className="text-white">Upload de Banner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ImageUploader onUploadComplete={handleUploadComplete} />
          {bannerUrl && (
            <div className="mt-4">
              <img 
                src={bannerUrl} 
                alt="Banner preview" 
                className="rounded-lg max-h-48 w-full object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
