import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    console.log('Iniciando upload da imagem:', { path, fileSize: file.size });

    // Criar uma referência para o arquivo no Storage
    const storageRef = ref(storage, `banners/${path}`);

    // Fazer o upload do arquivo
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload concluído:', snapshot);

    // Obter a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de download disponível:', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}