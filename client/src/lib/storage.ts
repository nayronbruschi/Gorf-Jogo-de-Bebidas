// Usar o servidor Express para uploads em vez do Firebase Storage

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem via servidor Express:', { 
      path, 
      fileSize: file.size,
      type: file.type,
      name: file.name
    });

    // Criar um FormData para enviar o arquivo
    const formData = new FormData();
    formData.append('file', file);

    // Enviar para a API de upload
    console.log('Enviando arquivo para o servidor...');
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro no servidor: ${errorData.message || 'Falha no upload'}`);
    }

    const data = await response.json();
    console.log('Upload concluído com sucesso. URL:', data.url);
    
    return data.url;
  } catch (error) {
    console.error('Erro no upload:', error);
    
    // Exibir informações detalhadas sobre o erro
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    
    throw new Error(`Falha no upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getImageUrl(path: string): Promise<string> {
  try {
    // No sistema atual, as imagens são servidas diretamente pelo servidor
    return `/api/images/${path}`;
  } catch (error) {
    console.error('Erro ao obter URL da imagem:', error);
    throw error;
  }
}