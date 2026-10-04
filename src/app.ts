import express from 'express';
import type { Config } from './config';
import { librosIniciales } from './datos-iniciales';
import { requiereApiKey } from './middlewares/api-key.middleware';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.middleware';
import { LibrosRepository } from './repositories/libros.repository';
import { librosRouter } from './routes/libros.routes';
import { LibrosService } from './services/libros.service';
import { version } from './version';

export function crearApp(config: Config) {
  const app = express();

  if (config.perfil === 'prod') {
    app.disable('x-powered-by');
  }

  app.use(express.json());

  const librosService = new LibrosService(new LibrosRepository());
  librosIniciales.forEach((libro) => librosService.crear(libro));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'UP',
      perfil: config.perfil,
      version,
      uptime: Math.round(process.uptime()),
    });
  });

  app.use('/api/v1/libros', librosRouter(librosService, requiereApiKey(config)));

  app.use(rutaNoEncontrada);
  app.use(manejadorErrores(config.perfil));

  return app;
}
