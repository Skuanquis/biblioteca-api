import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { crearApp } from '../../src/app';
import { cargarConfig } from '../../src/config';

describe('GET /health', () => {
  const app = crearApp(cargarConfig());

  it('responde UP con el perfil prod', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'UP', perfil: 'prod' });
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('en dev mantiene la cabecera x-powered-by', async () => {
    const appDev = crearApp({ perfil: 'dev', puerto: 3000 });

    const res = await request(appDev).get('/health');

    expect(res.body.perfil).toBe('dev');
    expect(res.headers['x-powered-by']).toBe('Express');
  });
});
