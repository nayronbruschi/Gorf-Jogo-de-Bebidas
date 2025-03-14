import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gorf.app',
  appName: 'Gorf',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
    hostname: 'app'
  },
  ios: {
    scheme: 'Gorf',
    contentInset: 'automatic',
    backgroundColor: '#000000',
    preferredContentMode: 'mobile'
  }
};

export default config;