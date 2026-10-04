import { randomUUID } from 'node:crypto';
import { HttpError } from '../http-error';
import type { LibrosRepository } from '../repositories/libros.repository';
import type { Libro, LibroInput } from '../schemas/libro.schema';

export class LibrosService {
  private readonly repository: LibrosRepository;

  constructor(repository: LibrosRepository) {
    this.repository = repository;
  }

  listar(autor?: string): Libro[] {
    const libros = this.repository.listar();
    if (!autor) {
      return libros;
    }
    const busqueda = autor.toLowerCase();
    return libros.filter((libro) => libro.autor.toLowerCase().includes(busqueda));
  }

  obtener(id: string): Libro {
    const libro = this.repository.buscar(id);
    if (!libro) {
      throw new HttpError(404, `No existe el libro con id ${id}`);
    }
    return libro;
  }

  crear(datos: LibroInput): Libro {
    this.validarIsbnUnico(datos.isbn);
    return this.repository.guardar({ id: randomUUID(), ...datos });
  }

  actualizar(id: string, datos: LibroInput): Libro {
    this.obtener(id);
    this.validarIsbnUnico(datos.isbn, id);
    return this.repository.guardar({ id, ...datos });
  }

  eliminar(id: string): void {
    if (!this.repository.eliminar(id)) {
      throw new HttpError(404, `No existe el libro con id ${id}`);
    }
  }

  private validarIsbnUnico(isbn: string | undefined, idActual?: string) {
    if (!isbn) {
      return;
    }
    const repetido = this.repository.listar().some((libro) => libro.isbn === isbn && libro.id !== idActual);
    if (repetido) {
      throw new HttpError(409, `Ya existe un libro con ISBN ${isbn}`);
    }
  }
}
