import { crearApp } from './app';
import { cargarConfig, type Config } from './config';
import { version } from './version';

let config: Config;
try {
  config = cargarConfig();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}

const app = crearApp(config);

const server = app.listen(config.puerto, () => {
  console.log(`Biblioteca API v${version} en el puerto ${config.puerto} (perfil ${config.perfil})`);
});

function apagar() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', apagar);
process.on('SIGTERM', apagar);
