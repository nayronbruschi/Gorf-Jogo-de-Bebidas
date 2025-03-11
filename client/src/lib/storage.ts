import { app } from "./firebase";

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem:', { 
      path, 
      fileSize: file.size,
      type: file.type,
      name: file.name
    });

    // Criar FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);

    // Fazer o upload para o bucket do Replit
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Upload concluído:', data);

    return data.url;
  } catch (error) {
    console.error('Erro no upload:', error);
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string> {
  const response = await fetch(`/api/images/${path}`);
  if (!response.ok) {
    throw new Error('Failed to get image URL');
  }
  const data = await response.json();
  return data.url;
}