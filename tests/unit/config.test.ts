import { describe, expect, it } from 'vitest';
import { cargarConfig } from '../../src/config';

describe('cargarConfig', () => {
  it('usa el perfil dev y el puerto 3000 por defecto', () => {
    expect(cargarConfig({})).toEqual({ perfil: 'dev', puerto: 3000, apiKey: undefined });
  });

  it('lee el perfil prod, el puerto y la api key', () => {
    const config = cargarConfig({ APP_PROFILE: 'prod', PORT: '8080', API_KEY: 'secreto' });

    expect(config).toEqual({ perfil: 'prod', puerto: 8080, apiKey: 'secreto' });
  });

  it('falla en prod si no hay API_KEY', () => {
    expect(() => cargarConfig({ APP_PROFILE: 'prod' })).toThrow('API_KEY');
  });

  it('rechaza un perfil desconocido', () => {
    expect(() => cargarConfig({ APP_PROFILE: 'qa' })).toThrow('Perfil no valido');
  });

  it('rechaza un puerto invalido', () => {
    expect(() => cargarConfig({ PORT: 'abc' })).toThrow('Puerto no valido');
  });
});
