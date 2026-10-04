import type { Libro } from '../schemas/libro.schema';

export class LibrosRepository {
  private readonly libros = new Map<string, Libro>();

  listar(): Libro[] {
    return [...this.libros.values()];
  }

  buscar(id: string): Libro | undefined {
    return this.libros.get(id);
  }

  guardar(libro: Libro): Libro {
    this.libros.set(libro.id, libro);
    return libro;
  }

  eliminar(id: string): boolean {
    return this.libros.delete(id);
  }
}
