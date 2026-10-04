declare const __APP_VERSION__: string | undefined;

export const version = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0-dev';
