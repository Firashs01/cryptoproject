import { cleanupData, startCleanupScheduler } from '../lib/cleanup.mjs';

const ignore = (error) => {
  console.error(`[cleanup] ${error instanceof Error ? error.message : String(error)}`);
};

export default function startupCleanup() {
  return {
    name: 'startup-cleanup',
    hooks: {
      'astro:server:setup': ({ logger }) => {
        logger?.info?.('Automatic data cleanup: running once at dev-server start, then every 24h.');
        try {
          startCleanupScheduler();
        } catch (error) {
          ignore(error);
        }
      },
      'astro:build:start': ({ logger }) => {
        logger?.info?.('Automatic data cleanup: running once before build.');
        cleanupData().catch(ignore);
      },
    },
  };
}
