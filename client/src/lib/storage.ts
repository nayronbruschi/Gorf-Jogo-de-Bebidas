import { app } from "./firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem:', { 
      path, 
      fileSize: file.size,
      type: file.type,
      name: file.name
    });

    // Verificar a conexão com o Firebase Storage
    console.log('Configuração do Firebase Storage bucket:', storage.app.options.storageBucket);
    
    // Upload para o Firebase Storage
    const storageRef = ref(storage, `images/${path}`);

    // Fazer o upload e aguardar a conclusão
    console.log('Enviando arquivo para o Firebase Storage...');
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload concluído. Metadata:', snapshot.metadata);

    // Obter a URL do arquivo
    console.log('Obtendo URL de download...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de download obtida com sucesso:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Erro no upload:', error);
    
    // Exibir informações detalhadas sobre o erro
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: (error as any).code, // Para erros do Firebase que têm código
        serverResponse: (error as any).serverResponse // Para erros de resposta do servidor
      });
      
      // Verificar erros comuns do Firebase Storage
      const errorCode = (error as any).code;
      if (errorCode === 'storage/unauthorized') {
        throw new Error('Acesso não autorizado ao Firebase Storage. Verifique as regras de segurança.');
      } else if (errorCode === 'storage/canceled') {
        throw new Error('Upload cancelado pelo usuário.');
      } else if (errorCode === 'storage/unknown') {
        throw new Error('Erro desconhecido durante o upload. Verifique a conexão de internet.');
      }
    }
    
    throw new Error(`Falha no upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

export async function getImageUrl(path: string): Promise<string> {
  try {
    const imageRef = ref(storage, `images/${path}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Erro ao obter URL da imagem:', error);
    throw error;
  }
}