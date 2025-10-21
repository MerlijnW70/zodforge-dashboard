// Types matching the ZodForge API

export interface ApiKeyInfo {
  kid: string;
  customerId: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  quota: {
    monthlyLimit: number;
  };
  permissions: string[];
  createdAt: string;
  expiresAt?: string;
  metadata?: {
    createdBy?: string;
    environment?: 'development' | 'production';
    ipWhitelist?: string[];
  };
}

export interface UsageStats {
  monthly: {
    requests: number;
    successRate: number;
    totalTokens: number;
    totalCost: number;
    avgLatency: number;
  } | null;
  daily: {
    requests: number;
    successRate: number;
    totalTokens: number;
    totalCost: number;
  } | null;
}

export interface ApiKeyResponse {
  success: boolean;
  key: ApiKeyInfo;
  usage: UsageStats;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    openai: { status: string; latency: number };
    anthropic: { status: string; latency: number };
    supabase: { status: string; latency: number };
  };
}
