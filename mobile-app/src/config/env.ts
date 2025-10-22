/*
  Centralized environment configuration for React Native app.
  - Uses __DEV__ to switch between development and production.
  - Override these URLs per your setup.
*/

export type AppEnvironment = 'development' | 'production';

export const CURRENT_ENV: AppEnvironment = __DEV__ ? 'development' : 'production';

// Use emulator-friendly hosts in development
let devHost = '127.0.0.1';
try {
  // Lazy import to avoid bundling issues in non-RN toolchains
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Platform } = require('react-native');
  devHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
} catch {}

const API_URL_BY_ENV: Record<AppEnvironment, string> = {
  development: `http://${devHost}:5000`,
  production: 'https://api.your-domain.com',
};

const WS_URL_BY_ENV: Record<AppEnvironment, string> = {
  development: `ws://${devHost}:5000`,
  production: 'wss://api.your-domain.com',
};

export const API_BASE_URL: string = API_URL_BY_ENV[CURRENT_ENV];
export const WS_URL: string = WS_URL_BY_ENV[CURRENT_ENV];

export const isProduction = CURRENT_ENV === 'production';
export const isDevelopment = CURRENT_ENV === 'development';


