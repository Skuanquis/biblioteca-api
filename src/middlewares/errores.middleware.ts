import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import type { Perfil } from '../config';
import { HttpError } from '../http-error';

export const rutaNoEncontrada: RequestHandler = (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
};

export function manejadorErrores(perfil: Perfil): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    if (err instanceof ZodError) {
      const detalles = err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      res.status(400).json({ error: 'Datos invalidos', detalles });
      return;
    }

    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }

    const status = typeof err.status === 'number' ? err.status : 500;
    if (status === 500) {
      console.error(err);
    }

    const mensaje = status === 500 ? 'Error interno del servidor' : err.message;
    res.status(status).json(perfil === 'dev' ? { error: mensaje, stack: err.stack } : { error: mensaje });
  };
}
