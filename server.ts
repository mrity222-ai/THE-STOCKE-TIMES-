import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app, initializeTables, startDailyAiScheduler } from './server/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function start() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 TheStockTimes server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
    try {
      await initializeTables();
    } catch (err: any) {
      console.warn('Initial tables setup warning:', err?.message || err);
    }
    try {
      startDailyAiScheduler();
    } catch (err: any) {
      console.warn('Daily AI scheduler warning:', err?.message || err);
    }
  });
}

start().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
