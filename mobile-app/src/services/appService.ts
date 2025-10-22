import { API_BASE_URL, WS_URL } from '../config/env';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getWebsocketUrl(): string {
  return WS_URL;
}

export function initializeApp(): void {
  // Place to initialize any services that need URLs
  // Example: configure axios or socket.io here
}


