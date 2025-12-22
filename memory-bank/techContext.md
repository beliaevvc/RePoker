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

## Cursor sandbox: быстрый fallback при `EPERM`
- **Симптом**: команда/действие падает с `EPERM` / `Operation not permitted` (часто при `npm install`, сборках, генерации файлов, доступе к “нестандартным” путям).
- **Частая причина**: ограничения sandbox (нет сети, запрет на запись/чтение вне workspace, запрет на изменение git‑состояния и т.п.).
- **Фолбэк (не тратить время на повторные прогоны “вслепую”)**:
  - **Нужна сеть** (установка зависимостей/загрузка): повторить команду с разрешением **`network`**.
  - **Нужна запись/чтение вне sandbox‑ограничений** (нестандартные места, игнорируемые файлы и пр.): эскалировать до **`all`**.
  - **Нужно менять git‑состояние** (коммиты/checkout и т.п.): запросить **`git_write`**.
  - Если уже один раз увидели `EPERM` и контекст явно “про доступы” — **сразу** повторять с нужными правами, а не делать 2–3 одинаковых запуска.
