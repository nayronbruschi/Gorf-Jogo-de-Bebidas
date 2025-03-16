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
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('Upload concluído:', downloadURL);

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
  const imageRef = ref(storage, `images/${path}`);
  return getDownloadURL(imageRef);
}