<!-- Copilot / AI contributor guidance for hosinfo2026 -->
# Copilot Instructions — hosinfo2026

This project is a Laravel 12 backend with an Inertia + React (TypeScript) frontend built with Vite. The notes below are targeted, actionable and codebase-specific so an AI coding agent can be productive immediately.

## Big picture
- **Backend:** Laravel (PHP 8.2+) in `app/` and `routes/`. Controllers in `app/Http/Controllers` return Inertia responses that map to React pages.
- **Frontend:** React + TypeScript under `resources/js`. Pages live in `resources/js/pages` and are resolved by `resources/js/app.tsx` via `resolvePageComponent('./pages/${name}.tsx', import.meta.glob('./pages/**/*.tsx'))`.
- **Build & SSR:** Vite is configured in `vite.config.ts`. SSR entry is `resources/js/ssr.tsx`. Blade shell is `resources/views/app.blade.php` which includes `@vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])`.

## How to run / dev workflows (exact commands)
- Start frontend dev server: `npm run dev` (or `pnpm`/`yarn` equivalent).
- Run full dev stack (server + queue + vite): `composer run-script dev` — uses `npx concurrently` to run `php artisan serve`, `php artisan queue:listen` and `npm run dev`.
- Start SSR dev stack: `composer run-script dev:ssr` to build SSR and run `php artisan pail` + `php artisan inertia:start-ssr` alongside server and queue.
- Build production assets: `npm run build` (or `composer` scripts that wrap `vite build`).
- Build for SSR: `npm run build:ssr`.
- Run PHP tests: `composer test` (runs `php artisan test`, the project uses Pest).
- Lint/format/type-check: `npm run lint`, `npm run format`, `npm run types`.

## Key conventions and patterns (do not break)
- Page/component mapping: Controller -> Inertia::render('namespace/path') maps to `resources/js/pages/namespace/path.tsx`. Example: `Route::get('/auth/login', fn() => Inertia::render('auth/login/index'))` -> `resources/js/pages/auth/login/index.tsx`.
- Vite aliases: `@/` -> `resources/js` (see `vite.config.ts`). Use `@/components`, `@/scss`, `@/data`, `@/images` when importing.
- Ziggy routing: Ziggy is used for route() in JS. SSR populates a global `route` implementation in `resources/js/ssr.tsx` — keep Ziggy config in sync when changing named routes.
- Styling: SCSS lives in `resources/scss`. Global import is `resources/js/app.tsx` -> `@/scss/app.scss`. Prefer existing variables files (`resources/scss/_variables*.scss`).
- Data files: Static datasets and fixtures live in `resources/data` (e.g., `menu-items.ts`, `products.ts`) — used by frontend components.

## Files to inspect for context when making changes
- Routing and page list: `routes/web.php` and `routes/auth.php`.
- Frontend entry & page resolution: `resources/js/app.tsx`, `resources/js/ssr.tsx`.
- Blade shell and Vite integration: `resources/views/app.blade.php`.
- Vite config and aliases: `vite.config.ts`.
- Composer & npm scripts: `composer.json`, `package.json`.

## Typical small tasks — examples
- Add a new page: create `resources/js/pages/foo/bar.tsx`, update controller to `Inertia::render('foo/bar')`, then run `npm run dev`.
- Add a global alias import: update `vite.config.ts` and use `@/newpath` imports in TS files.
- Fix SSR route bug: check `resources/js/ssr.tsx` for how `page.props.ziggy` is passed; ensure `location` is provided when rendering server-side.

## Notes for tests, CI, and PRs
- Tests: run `composer test`. Use Pest test files under `tests/Feature` and `tests/Unit`.
- Static checks before PRs: run `npm run lint`, `npm run types`, `npm run format:check`.
- Do not modify the Blade `@vite` inclusion unless adding/removing page entries that must be precompiled.

If anything in these instructions is unclear, or you want me to add examples for a particular part of the codebase (controllers, a specific page, or the SSR flow), tell me which area and I'll expand the guide.
