import { OpenClawdClient, type ApiClientConfig } from '@openclawdsolana/api-client';
import { getEntityId } from './utils';

const getLocalStorageApiKey = () => `openclawd-api-key-${window.location.origin}`;

export function createApiClientConfig(): ApiClientConfig {
  const apiKey = localStorage.getItem(getLocalStorageApiKey());
  const entityId = getEntityId();

  const config: ApiClientConfig = {
    baseUrl: window.location.origin,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
      'X-Entity-Id': entityId,
    },
  };

  // Only include apiKey if it exists (don't pass undefined)
  if (apiKey) {
    config.apiKey = apiKey;
  }

  return config;
}

/**
 * Singleton pattern with explicit cache invalidation.
 *
 */
let openclawdClientInstance: OpenClawdClient | null = null;

export function createOpenClawdClient(): OpenClawdClient {
  return OpenClawdClient.create(createApiClientConfig());
}

export function getOpenClawdClient(): OpenClawdClient {
  if (!openclawdClientInstance) {
    openclawdClientInstance = createOpenClawdClient();
  }
  return openclawdClientInstance;
}

/**
 * Invalidate the cached client instance.
 */
function invalidateOpenClawdClient(): void {
  openclawdClientInstance = null;
}

export function updateApiClientApiKey(newApiKey: string | null): void {
  if (newApiKey) {
    localStorage.setItem(getLocalStorageApiKey(), newApiKey);
  } else {
    localStorage.removeItem(getLocalStorageApiKey());
  }
  invalidateOpenClawdClient();
}
