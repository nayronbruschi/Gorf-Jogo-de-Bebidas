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

    // Upload para o Firebase Storage
    const storageRef = ref(storage, `images/${path}`);

    // Fazer o upload e aguardar a conclusão
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload concluído. Metadata:', snapshot.metadata);

    // Obter a URL do arquivo
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de download:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Erro no upload:', error);
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
    const imageRef = ref(storage, `images/${path}`);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Erro ao obter URL da imagem:', error);
    throw error;
  }
}