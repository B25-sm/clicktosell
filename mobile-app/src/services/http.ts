import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../config/env';

let client: AxiosInstance | null = null;

export function getHttpClient(): AxiosInstance {
  if (!client) {
    client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
    });
  }
  return client;
}


