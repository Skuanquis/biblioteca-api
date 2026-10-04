# Biblioteca API

[![CI - Build y Test](https://github.com/Skuanquis/biblioteca-api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Skuanquis/biblioteca-api/actions/workflows/ci.yml)
[![Deploy - Release](https://github.com/Skuanquis/biblioteca-api/actions/workflows/release.yml/badge.svg)](https://github.com/Skuanquis/biblioteca-api/actions/workflows/release.yml)
[![Release](https://img.shields.io/github/v/release/Skuanquis/biblioteca-api)](https://github.com/Skuanquis/biblioteca-api/releases/latest)

API REST hecha en TypeScript con Express para gestionar los libros de una biblioteca.

Proyecto final del curso de CI/CD: tiene un workflow de build y test con matrix build en Ubuntu y macOS, y otro workflow solo para deploy que publica un release en GitHub con el ejecutable para descargar.

## Tecnologías

- Node.js 22+ y TypeScript
- Express 5 y Zod para validaciones
- Vitest y Supertest para las pruebas
- ESLint
- esbuild, que empaqueta toda la API en un solo archivo `.cjs` que se ejecuta con `node`
- GitHub Actions

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado de la API, perfil y versión |
| GET | `/api/v1/libros` | Lista los libros. Acepta el filtro `?autor=` |
| GET | `/api/v1/libros/:id` | Obtiene un libro |
| POST | `/api/v1/libros` | Crea un libro |
| PUT | `/api/v1/libros/:id` | Actualiza un libro |
| DELETE | `/api/v1/libros/:id` | Elimina un libro |

Ejemplo de libro:

```json
{
  "titulo": "El Aleph",
  "autor": "Jorge Luis Borges",
  "anio": 1949,
  "disponible": true
}
```

También se puede enviar `isbn` (opcional, de 10 a 17 caracteres). `disponible` por defecto es `true`. No se permiten dos libros con el mismo ISBN.

Los datos se guardan en memoria, al reiniciar la API vuelve a los 3 libros iniciales.

## Perfiles

El perfil se elige con la variable `APP_PROFILE`:

- `dev` (por defecto): no pide API key y los errores muestran el detalle.
- `prod`: POST, PUT y DELETE necesitan la cabecera `x-api-key` con el valor de `API_KEY`, los errores no muestran el stack y la API no arranca si falta `API_KEY`.

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `APP_PROFILE` | `dev` | `dev` o `prod` |
| `PORT` | `3000` | Puerto de la API |
| `API_KEY` | | Obligatoria en prod |

## Ejecución local

```bash
npm install
npm run dev
```

Con el perfil prod:

```bash
export APP_PROFILE=prod
export API_KEY="mi_clave"
npm run build
npm start
```

Probando los endpoints:

```bash
curl http://localhost:3000/api/v1/libros

curl -X POST http://localhost:3000/api/v1/libros \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_clave" \
  -d '{"titulo":"El Aleph","autor":"Jorge Luis Borges","anio":1949}'

curl -X PUT http://localhost:3000/api/v1/libros/<id> \
  -H "Content-Type: application/json" \
  -H "x-api-key: mi_clave" \
  -d '{"titulo":"El Aleph","autor":"Jorge Luis Borges","anio":1949,"disponible":false}'

curl -X DELETE http://localhost:3000/api/v1/libros/<id> -H "x-api-key: mi_clave"
```

## Pruebas

Las pruebas se ejecutan con el perfil prod (configurado en `vitest.config.ts`).

```bash
npm test
npm run test:coverage
```

`test:coverage` falla si la cobertura baja del 80%.

También hay un smoke test que levanta el ejecutable compilado y prueba el CRUD completo con `curl`:

```bash
npm run build
APP_PROFILE=prod API_KEY=mi_clave npm run smoke
```

## CI/CD

```
push / pull request a main o develop
  └── CI - Build y Test (ubuntu-latest y macos-latest, Node 22 y 24)
        npm ci → lint → typecheck → pruebas (perfil prod) → build → smoke test → artifacts

push de un tag vX.Y.Z
  └── Deploy - Release
        build: valida el tag, compila y empaqueta los assets
          └── release: crea el release en GitHub y sube los assets
```

### CI - Build y Test

Archivo: [.github/workflows/ci.yml](.github/workflows/ci.yml)

Se ejecuta en cada push y pull request a `main` y `develop`. Usa una matrix de 4 combinaciones:

| Sistema operativo | Node.js |
|-------------------|---------|
| ubuntu-latest | 22 y 24 |
| macos-latest | 22 y 24 |

Cada combinación instala dependencias con caché de npm, revisa el código con ESLint y TypeScript, corre las pruebas con cobertura, genera el ejecutable y le hace el smoke test. Al final sube el build como artifact; el reporte de cobertura solo se sube desde ubuntu con Node 24.

El smoke test usa el secret `API_KEY` del repositorio si está configurado.

### Deploy - Release

Archivo: [.github/workflows/release.yml](.github/workflows/release.yml)

Solo se ejecuta cuando se sube un tag `vX.Y.Z`. Tiene dos jobs:

1. `build`: valida que el tag coincida con la versión del `package.json`, compila y arma los assets.
2. `release`: descarga los assets del job anterior y crea el release en GitHub.

Assets del release:

- `biblioteca-api-vX.Y.Z.cjs`: la API en un solo archivo
- `biblioteca-api-vX.Y.Z.zip`: el ejecutable con el README y el `.env.example`

## Crear un release

Se cambia la versión, se sube el cambio y luego el tag:

```bash
npm version 1.1.0 --no-git-tag-version
git commit -am "chore: version 1.1.0"
git push origin main
git tag v1.1.0
git push origin v1.1.0
```

## Ejecutar el release descargado

Requiere Node.js 22 o superior. Sin variables de entorno arranca en perfil dev en el puerto 3000.

### Linux y macOS

```bash
export APP_PROFILE=prod
export API_KEY="mi_clave"
node biblioteca-api-v1.0.0.cjs
```

### Windows (CMD)

```bash
set APP_PROFILE=prod
set API_KEY=mi_clave
node biblioteca-api-v1.0.0.cjs
```

## Requisitos de la práctica

- Repositorio público en GitHub con un proyecto en TypeScript.
- Workflow de build y test con matrix build en `ubuntu-latest` y `macos-latest`: `ci.yml`.
- Workflow independiente solo para deploy que genera un release con assets descargables: `release.yml`.
- Endpoints GET, POST, PUT y DELETE con pruebas usando el perfil prod.
