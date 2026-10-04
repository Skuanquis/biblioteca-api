import type { RequestHandler } from 'express';
import type { Config } from '../config';

export function requiereApiKey(config: Config): RequestHandler {
  return (req, res, next) => {
    if (config.perfil === 'dev' || req.get('x-api-key') === config.apiKey) {
      next();
      return;
    }
    res.status(401).json({ error: 'API key invalida o ausente' });
  };
}
