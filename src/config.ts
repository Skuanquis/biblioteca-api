export type Perfil = 'dev' | 'prod';

export interface Config {
  perfil: Perfil;
  puerto: number;
  apiKey?: string;
}

export function cargarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const perfil = env.APP_PROFILE ?? 'dev';
  if (perfil !== 'dev' && perfil !== 'prod') {
    throw new Error(`Perfil no valido: ${perfil}. Use dev o prod`);
  }

  const puerto = Number(env.PORT ?? 3000);
  if (!Number.isInteger(puerto) || puerto <= 0) {
    throw new Error(`Puerto no valido: ${env.PORT}`);
  }

  const apiKey = env.API_KEY || undefined;
  if (perfil === 'prod' && !apiKey) {
    throw new Error('API_KEY es obligatoria en el perfil prod');
  }

  return { perfil, puerto, apiKey };
}
