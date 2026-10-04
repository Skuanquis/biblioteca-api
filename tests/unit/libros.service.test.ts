import { beforeEach, describe, expect, it } from 'vitest';
import { HttpError } from '../../src/http-error';
import { LibrosRepository } from '../../src/repositories/libros.repository';
import type { LibroInput } from '../../src/schemas/libro.schema';
import { LibrosService } from '../../src/services/libros.service';

const ficciones: LibroInput = { titulo: 'Ficciones', autor: 'Jorge Luis Borges', anio: 1944, isbn: '1111111111', disponible: true };
const aleph: LibroInput = { titulo: 'El Aleph', autor: 'Jorge Luis Borges', anio: 1949, disponible: true };
const rayuela: LibroInput = { titulo: 'Rayuela', autor: 'Julio Cortázar', anio: 1963, disponible: false };

describe('LibrosService', () => {
  let service: LibrosService;

  beforeEach(() => {
    service = new LibrosService(new LibrosRepository());
  });

  it('crea un libro con id', () => {
    const libro = service.crear(ficciones);

    expect(libro.id).toBeTruthy();
    expect(libro).toMatchObject(ficciones);
    expect(service.listar()).toHaveLength(1);
  });

  it('filtra por autor sin importar mayusculas', () => {
    service.crear(ficciones);
    service.crear(aleph);
    service.crear(rayuela);

    expect(service.listar('borges')).toHaveLength(2);
    expect(service.listar('CORTÁZAR')).toHaveLength(1);
    expect(service.listar()).toHaveLength(3);
  });

  it('obtiene un libro por id', () => {
    const creado = service.crear(aleph);

    expect(service.obtener(creado.id)).toEqual(creado);
  });

  it('lanza 404 si el libro no existe', () => {
    expect(() => service.obtener('no-existe')).toThrow(HttpError);
    expect(() => service.obtener('no-existe')).toThrow('No existe el libro');
  });

  it('no permite dos libros con el mismo ISBN', () => {
    service.crear(ficciones);

    expect(() => service.crear({ ...aleph, isbn: ficciones.isbn })).toThrow('Ya existe un libro con ISBN');
  });

  it('actualiza un libro manteniendo su id', () => {
    const creado = service.crear(ficciones);

    const actualizado = service.actualizar(creado.id, { ...ficciones, disponible: false });

    expect(actualizado).toEqual({ ...ficciones, id: creado.id, disponible: false });
  });

  it('al actualizar permite conservar el mismo ISBN', () => {
    const creado = service.crear(ficciones);

    expect(() => service.actualizar(creado.id, { ...ficciones, anio: 1956 })).not.toThrow();
  });

  it('al actualizar rechaza el ISBN de otro libro', () => {
    service.crear(ficciones);
    const otro = service.crear(aleph);

    expect(() => service.actualizar(otro.id, { ...aleph, isbn: ficciones.isbn })).toThrow(HttpError);
  });

  it('lanza 404 al actualizar un libro inexistente', () => {
    expect(() => service.actualizar('no-existe', aleph)).toThrow('No existe el libro');
  });

  it('elimina un libro', () => {
    const creado = service.crear(rayuela);

    service.eliminar(creado.id);

    expect(service.listar()).toHaveLength(0);
    expect(() => service.eliminar(creado.id)).toThrow(HttpError);
  });
});
