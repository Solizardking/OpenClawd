import { useQuery } from '@tanstack/react-query';
import { getOpenClawdClient } from '@/lib/api-client-config';
import clientLogger from '@/lib/logger';
import type { Agent } from '@openclawdsolana/api-client';

// Registry configuration - centralized for maintainability
const REGISTRY_ORG = 'openclawd-plugins';
const REGISTRY_REPO = 'registry';
const REGISTRY_URL = `https://raw.githubusercontent.com/${REGISTRY_ORG}/${REGISTRY_REPO}/refs/heads/main/generated-registry.json`;

interface GitVersionInfo {
  version: string | null;
  branch: string | null;
}

interface PluginGitInfo {
  repo: string;
  v0: GitVersionInfo;
  v1: GitVersionInfo;
}

interface PluginNpmInfo {
  repo: string;
  v0: string | null;
  v1: string | null;
}

interface PluginSupport {
  v0: boolean;
  v1: boolean;
}

interface PluginInfo {
  git: PluginGitInfo;
  npm: PluginNpmInfo;
  supports: PluginSupport;
}

interface RegistryResponse {
  lastUpdatedAt: string;
  registry: Record<string, PluginInfo>;
}

/**
 * Function to fetch plugins data from the registry API and merge with agent plugins.
 * @returns {UseQueryResult<PluginEntry[]>} Query result containing array of plugin entries
 */
export function usePlugins() {
  return useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      try {
        // Fetch plugins from registry and agent data in parallel
        const openclawdClient = getOpenClawdClient();
        const [registryResponse, agentsResponse] = await Promise.all([
          fetch(REGISTRY_URL),
          openclawdClient.agents.listAgents(),
        ]);

        // Process registry data
        const registryData: RegistryResponse = await registryResponse.json();

        // Extract plugin names from registry that support v1 and are plugins
        const registryPlugins = Object.entries(registryData.registry || {})
          .filter(([name, data]: [string, PluginInfo]) => {
            // Check if it's a plugin and has v1 support
            const isPlugin = name.includes('plugin');
            const hasV1Support = data.supports.v1 === true;
            const hasV1Version =
              data.npm.v1 !== null || (data.git.v1.version !== null && data.git.v1.branch !== null);

            return isPlugin && hasV1Support && hasV1Version;
          })
          .map(([name]) => name.replace(/^@openclawd-plugins\//, '@openclawdsolana/'))
          .sort();

        // Process agent plugins from the parallel fetch
        let agentPlugins: string[] = [];
        try {
          const agents = agentsResponse?.agents || [];
          if (agents.length > 0) {
            // Get plugins from the first active agent
            const activeAgent = agents.find((agent) => agent.status === 'active');
            if (activeAgent && activeAgent.id) {
              const agentDetailResponse = await openclawdClient.agents.getAgent(activeAgent.id);

              // Extract plugins from the agent response
              interface AgentWithPlugins extends Agent {
                plugins?: string[];
              }
              const plugins = (agentDetailResponse as AgentWithPlugins)?.plugins;
              if (Array.isArray(plugins)) {
                agentPlugins = plugins;
              }
            }
          }
        } catch (agentError) {
          clientLogger.warn('Could not fetch agent plugins:', agentError);
        }

        // Merge registry plugins with agent plugins and remove duplicates
        const allPlugins = [...new Set([...registryPlugins, ...agentPlugins])];
        return allPlugins.sort();
      } catch (error) {
        clientLogger.error('Failed to fetch from registry, falling back to basic list:', error);

        // Return fallback plugins with basic info
        return [
          '@openclawdsolana/plugin-bootstrap',
          '@openclawdsolana/plugin-evm',
          '@openclawdsolana/plugin-discord',
          '@openclawdsolana/plugin-elevenlabs',
          '@openclawdsolana/plugin-anthropic',
          '@openclawdsolana/plugin-browser',
          '@openclawdsolana/plugin-farcaster',
          '@openclawdsolana/plugin-groq',
        ]
          .filter((name) => name.includes('plugin'))
          .sort();
      }
    },
  });
}
