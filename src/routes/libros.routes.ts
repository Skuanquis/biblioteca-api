import { Router, type Request, type RequestHandler } from 'express';
import { libroSchema } from '../schemas/libro.schema';
import type { LibrosService } from '../services/libros.service';

export function librosRouter(service: LibrosService, protegerEscritura: RequestHandler) {
  const router = Router();

  router.get('/', (req, res) => {
    const autor = typeof req.query.autor === 'string' ? req.query.autor : undefined;
    res.json(service.listar(autor));
  });

  router.get('/:id', (req, res) => {
    res.json(service.obtener(req.params.id));
  });

  router.post('/', protegerEscritura, (req, res) => {
    const libro = service.crear(libroSchema.parse(req.body));
    res.status(201).location(`${req.baseUrl}/${libro.id}`).json(libro);
  });

  router.put('/:id', protegerEscritura, (req: Request<{ id: string }>, res) => {
    res.json(service.actualizar(req.params.id, libroSchema.parse(req.body)));
  });

  router.delete('/:id', protegerEscritura, (req: Request<{ id: string }>, res) => {
    service.eliminar(req.params.id);
    res.status(204).end();
  });

  return router;
}
