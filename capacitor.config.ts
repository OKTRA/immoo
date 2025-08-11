import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.immoo.app',
  appName: 'immoo',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
