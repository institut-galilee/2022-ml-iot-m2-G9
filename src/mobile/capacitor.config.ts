import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'mobile',
  webDir: 'www',
  bundledWebRuntime: false,
  "server": {
    "hostname": "192.168.1.100",
    "cleartext": true,
    "allowNavigation": [
      "192.168.1.100"
    ]
  },
  "android": {
    "allowMixedContent": true
  }
};

export default config;
