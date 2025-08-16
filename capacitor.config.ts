import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pro.immoo.app',
  appName: 'immoo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Configuration pour l'authentification mobile
    App: {
      // Gestion des URL schemes pour l'authentification
      urlScheme: 'pro.immoo.app'
    }
  }
};

export default config;
