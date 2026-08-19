# AGENTS.md

## Cursor Cloud specific instructions

This is a single-product, client-only **Vite + React + TypeScript** browser game (`boy-dream-toy`, "属性对决 · 人机闯关"). All game logic runs in the browser; there is **no backend, database, or other service**. Standard commands live in `package.json` and `README.md`; only non-obvious notes are captured here.

### Services

| Service | Command | Notes |
|---|---|---|
| Vite dev server | `npm run dev` | Serves the SPA + static card art from `public/cards/`. Fixed to port **19561** (set in `vite.config.ts`, both `server` and `preview`), not the Vite default 5173. |

### Testing / build / lint

- Tests: `npm test` (Vitest, runs the pure engine unit tests under `src/engine/__tests__/`). The Vitest config is inline in `vite.config.ts` and uses the `node` environment (no jsdom) because the engine layer is framework-agnostic.
- Build: `npm run build` runs `tsc -b` (typecheck) then `vite build`. A build failure is usually a TypeScript error, not a bundler error.
- Lint: **no linter is configured** (no ESLint/Prettier, no `lint` script). Do not assume a lint step exists.

### Notes

- The engine layer (`src/engine/`) is intentionally pure/deterministic and React-free; prefer adding logic + unit tests there. The React presentation layer is in `src/ui/`.
- Audio (BGM/SFX) is generated programmatically via the Web Audio API and only starts after a user gesture, so it will be silent until you interact with the page.
