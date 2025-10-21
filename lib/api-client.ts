// API client for ZodForge API
import type { ApiKeyResponse, HealthResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ZodForgeApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    return response.json();
  }

  async getKeyInfo(): Promise<ApiKeyResponse> {
    return this.request<ApiKeyResponse>('/api/v1/api-keys/me');
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/v1/health');
  }

  async rotateKey(kid: string): Promise<{ success: boolean; apiKey: string }> {
    return this.request<{ success: boolean; apiKey: string }>(
      `/api/v1/api-keys/${kid}/rotate`,
      {
        method: 'POST',
      }
    );
  }
}

// Verify API key is valid
export async function verifyApiKey(apiKey: string): Promise<ApiKeyResponse | null> {
  try {
    const client = new ZodForgeApiClient(apiKey);
    const response = await client.getKeyInfo();
    return response;
  } catch (error) {
    console.error('API key verification failed:', error);
    return null;
  }
}
