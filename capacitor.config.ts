import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gorf.app',
  appName: 'Gorf',
  webDir: 'dist', // Diretório onde o Vite gera o build
  bundledWebRuntime: false
};

export default config;