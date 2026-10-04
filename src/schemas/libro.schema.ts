import { z } from 'zod';

z.config(z.locales.es());

export const libroSchema = z.object({
  titulo: z.string().trim().min(1),
  autor: z.string().trim().min(1),
  anio: z.number().int().min(1000).max(new Date().getFullYear()),
  isbn: z.string().trim().min(10).max(17).optional(),
  disponible: z.boolean().default(true),
});

export type LibroInput = z.infer<typeof libroSchema>;

export interface Libro extends LibroInput {
  id: string;
}
