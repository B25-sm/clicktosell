import { API_BASE_URL, WS_URL } from '../config/env';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getWebsocketUrl(): string {
  return WS_URL;
}

export const initializeApp = async () => {
  // Initialize app services
  // Setup notifications, analytics, etc.
  console.log('App initialized');
};


