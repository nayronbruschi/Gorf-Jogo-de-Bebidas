import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem:', { 
      path, 
      fileSize: file.size,
      type: file.type,
      name: file.name
    });

    // Criar uma referência para o arquivo no Storage com o caminho completo
    const storageRef = ref(storage, `banners/${path}`);
    console.log('Storage reference criada:', storageRef.fullPath);

    // Fazer o upload do arquivo
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload concluído:', {
      bytesTransferred: snapshot.bytesTransferred,
      totalBytes: snapshot.totalBytes,
      fullPath: snapshot.ref.fullPath
    });

    // Obter a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de download disponível:', downloadURL);

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
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}