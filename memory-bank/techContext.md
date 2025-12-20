# Tech Context — RePoker

## Стек
- **Runtime**: Node.js (локально), браузер (приложение)
- **Bundler**: Vite (`vite`, `vite build`, `vite preview`)
- **UI**: React **19** (JS/JSX)
- **Язык**: постепенная миграция на TypeScript (в первую очередь `domain`/`application`)
- **Styling**: Tailwind CSS **v4** через `@tailwindcss/vite` + кастомный CSS (`src/balatroInferno.css`)
- **Icons**: `lucide-react`
- **Particles (потенциально)**: зависимости `@tsparticles/*` (сейчас в коде не обнаружены, возможно под будущие эффекты)
- **Тесты**: Vitest (`npm run test`, `npm run test:watch`)

## Качество/линт
- ESLint (flat config): `eslint.config.js`
- Скрипт: `npm run lint`

## Команды проекта
- `npm run dev` — дев-сервер
- `npm run build` — сборка
- `npm run preview` — просмотр production-сборки
- `npm run lint` — линт
- `npm run test` — unit‑тесты (Vitest)
- `npm run test:watch` — Vitest watch

## Структура исходников
- `src/main.jsx` → `src/App.jsx` → `src/BalatroInferno.jsx` (ре‑экспорт) → `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
- CSS:
  - `src/index.css` (Tailwind import + базовые стили)
  - `src/balatroInferno.css` (шрифт/анимации/эффекты)
- Clean Architecture:
  - `src/domain/**`
  - `src/application/**`
  - `src/infrastructure/**`
  - `src/ui/**`

## TypeScript (текущая политика)
- TS включён и используется для слоёв `domain`/`application`/`infrastructure`, UI пока на JS/JSX.
- `tsconfig.json`: `strict: true`, `moduleResolution: "bundler"`, `noEmit: true`.
