import type { LibroInput } from './schemas/libro.schema';

export const librosIniciales: LibroInput[] = [
  { titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967, disponible: true },
  { titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, disponible: true },
  { titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 1955, disponible: false },
];
