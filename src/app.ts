import express from 'express';
import type { Config } from './config';
import { version } from './version';

export function crearApp(config: Config) {
  const app = express();

  if (config.perfil === 'prod') {
    app.disable('x-powered-by');
  }

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      perfil: config.perfil,
      version,
      uptime: Math.round(process.uptime()),
    });
  });

  return app;
}
