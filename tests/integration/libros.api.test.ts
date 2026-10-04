import type { Express } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { crearApp } from '../../src/app';
import { cargarConfig } from '../../src/config';

const config = cargarConfig();
const apiKey = config.apiKey ?? '';
const nuevoLibro = { titulo: 'El túnel', autor: 'Ernesto Sabato', anio: 1948 };

describe('API de libros con perfil prod', () => {
  let app: Express;

  beforeEach(() => {
    app = crearApp(config);
  });

  it('usa el perfil prod', () => {
    expect(config.perfil).toBe('prod');
  });

  it('GET /api/v1/libros lista los libros iniciales', async () => {
    const res = await request(app).get('/api/v1/libros');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('GET /api/v1/libros?autor= filtra por autor', async () => {
    const res = await request(app).get('/api/v1/libros').query({ autor: 'rulfo' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe('Pedro Páramo');
  });

  it('POST sin API key responde 401', async () => {
    const res = await request(app).post('/api/v1/libros').send(nuevoLibro);

    expect(res.status).toBe(401);
  });

  it('POST con API key crea el libro', async () => {
    const res = await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(nuevoLibro);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...nuevoLibro, disponible: true });
    expect(res.headers.location).toBe(`/api/v1/libros/${res.body.id}`);
  });

  it('POST con datos invalidos responde 400', async () => {
    const res = await request(app)
      .post('/api/v1/libros')
      .set('x-api-key', apiKey)
      .send({ titulo: '', anio: 'mil' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Datos invalidos');
    expect(res.body.detalles.length).toBeGreaterThan(0);
  });

  it('POST con JSON mal formado responde 400 sin stack', async () => {
    const res = await request(app)
      .post('/api/v1/libros')
      .set('x-api-key', apiKey)
      .set('Content-Type', 'application/json')
      .send('{"titulo": ');

    expect(res.status).toBe(400);
    expect(res.body.stack).toBeUndefined();
  });

  it('POST con ISBN repetido responde 409', async () => {
    const conIsbn = { ...nuevoLibro, isbn: '9876543210' };
    await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(conIsbn);

    const res = await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(conIsbn);

    expect(res.status).toBe(409);
  });

  it('GET /api/v1/libros/:id devuelve el libro', async () => {
    const creado = await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(nuevoLibro);

    const res = await request(app).get(`/api/v1/libros/${creado.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(creado.body);
  });

  it('GET /api/v1/libros/:id responde 404 si no existe', async () => {
    const res = await request(app).get('/api/v1/libros/no-existe');

    expect(res.status).toBe(404);
  });

  it('PUT /api/v1/libros/:id actualiza el libro', async () => {
    const creado = await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(nuevoLibro);

    const res = await request(app)
      .put(`/api/v1/libros/${creado.body.id}`)
      .set('x-api-key', apiKey)
      .send({ ...nuevoLibro, disponible: false });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ...nuevoLibro, id: creado.body.id, disponible: false });
  });

  it('PUT sin API key responde 401', async () => {
    const res = await request(app).put('/api/v1/libros/cualquiera').send(nuevoLibro);

    expect(res.status).toBe(401);
  });

  it('PUT de un libro inexistente responde 404', async () => {
    const res = await request(app).put('/api/v1/libros/no-existe').set('x-api-key', apiKey).send(nuevoLibro);

    expect(res.status).toBe(404);
  });

  it('DELETE /api/v1/libros/:id elimina el libro', async () => {
    const creado = await request(app).post('/api/v1/libros').set('x-api-key', apiKey).send(nuevoLibro);

    const res = await request(app).delete(`/api/v1/libros/${creado.body.id}`).set('x-api-key', apiKey);
    const busqueda = await request(app).get(`/api/v1/libros/${creado.body.id}`);

    expect(res.status).toBe(204);
    expect(busqueda.status).toBe(404);
  });

  it('DELETE sin API key responde 401', async () => {
    const res = await request(app).delete('/api/v1/libros/cualquiera');

    expect(res.status).toBe(401);
  });

  it('DELETE de un libro inexistente responde 404', async () => {
    const res = await request(app).delete('/api/v1/libros/no-existe').set('x-api-key', apiKey);

    expect(res.status).toBe(404);
  });

  it('una ruta desconocida responde 404', async () => {
    const res = await request(app).get('/api/v1/autores');

    expect(res.status).toBe(404);
  });
});

describe('API de libros con perfil dev', () => {
  const app = crearApp({ perfil: 'dev', puerto: 3000 });

  it('permite crear libros sin API key', async () => {
    const res = await request(app).post('/api/v1/libros').send(nuevoLibro);

    expect(res.status).toBe(201);
  });

  it('incluye el stack en los errores', async () => {
    const res = await request(app)
      .post('/api/v1/libros')
      .set('Content-Type', 'application/json')
      .send('{"titulo": ');

    expect(res.status).toBe(400);
    expect(res.body.stack).toBeDefined();
  });
});
