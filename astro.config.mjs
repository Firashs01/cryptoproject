import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import startupCleanup from './src/integrations/startup-cleanup.mjs';

export default defineConfig({
  site: 'https://cryptowords.example.com',
  integrations: [sitemap(), startupCleanup()],
});
