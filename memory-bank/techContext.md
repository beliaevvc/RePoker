# Tech Context — RePoker

## Стек
- **Runtime**: Node.js (локально), браузер (приложение)
- **Bundler**: Vite (`vite`, `vite build`, `vite preview`)
- **UI**: React **19** (JS/JSX)
- **Styling**: Tailwind CSS **v4** через `@tailwindcss/vite` + кастомный CSS (`src/balatroInferno.css`)
- **Icons**: `lucide-react`
- **Particles (потенциально)**: зависимости `@tsparticles/*` (сейчас в коде не обнаружены, возможно под будущие эффекты)

## Качество/линт
- ESLint (flat config): `eslint.config.js`
- Скрипт: `npm run lint`

## Команды проекта
- `npm run dev` — дев-сервер
- `npm run build` — сборка
- `npm run preview` — просмотр production-сборки
- `npm run lint` — линт

## Структура исходников
- `src/main.jsx` → `src/App.jsx` → `src/BalatroInferno.jsx`
- CSS:
  - `src/index.css` (Tailwind import + базовые стили)
  - `src/balatroInferno.css` (шрифт/анимации/эффекты)
