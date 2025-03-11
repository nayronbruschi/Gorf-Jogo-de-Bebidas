import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Criar uma referência para o arquivo no Storage
    const storageRef = ref(storage, `banners/${path}`);

    // Fazer o upload do arquivo
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a file!', snapshot);

    // Obter a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getImageUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}
