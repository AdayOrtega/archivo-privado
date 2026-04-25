# Archivo Privado

Mini web premium en React + Vite para GitHub Pages. La experiencia contiene cinco fases con puzzles interactivos, progreso persistente en `localStorage` y un modo host oculto.

## Requisitos

- Node.js 20 o superior
- npm

## Instalacion

```bash
npm install
```

## Ejecutar en local

```bash
npm run dev
```

Vite mostrara la URL local, normalmente `http://localhost:5173`.

## Build

```bash
npm run build
```

La salida queda en `dist/`.

## Preview del build

```bash
npm run preview
```

## Deploy en GitHub Pages

El proyecto ya incluye:

- `vite.config.js` configurado para GitHub Pages
- `.github/workflows/deploy.yml`
- `public/.nojekyll`

Pasos:

1. Crea el repositorio de GitHub Pages que vayas a usar.
2. Sube el proyecto a la rama `main`.
3. En GitHub, ve a `Settings > Pages`.
4. En `Build and deployment`, selecciona `GitHub Actions`.
5. Haz push a `main` o ejecuta manualmente el workflow `Deploy to GitHub Pages`.

## Modo host

El modo host no aparece en la interfaz principal. Escribe `HOST` con el teclado en cualquier fase para abrirlo.

Permite:

- Avanzar o retroceder fase manualmente
- Ver respuestas
- Conceder tokens
- Ver evidencias secundarias
- Activar pistas y ayudas
- Configurar datos de la tarjeta de embarque
- Resetear la partida

## Tokens de la experiencia

- Fase 1: `NOAH`
- Fase 2: `CUADRA`
- Fase 3: `LACULATAII`
- Fase 4: `TRAZA`
- Fase 5: destino secreto
