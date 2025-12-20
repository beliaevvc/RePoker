# Архив — Turbo-кнопка (ускорение темповых анимаций)

Task ID: 2025-12-21-turbo-button  
Дата: 2025-12-21

## Summary
Добавлена кнопка **TURBO** (toggle ON/OFF), которая ускоряет “темповые” анимации и задержки (раздача, каскад, появление/пересдача/поп‑эффект множителя), **не** ускоряя декоративные shake/ореолы/орбы/синематику.

## Requirements
- Turbo — **toggle ON/OFF**
- **Ускорять**: появления/пересдачу карт, анимации выигрыша/каскада (таймлайн шага)
- **Не ускорять**: “дёргания” баннеров (shake/jitter), “ореолы/обволакивания” карт, `ElectricPlasmaOrbs`, MAX WIN cinematic
- **Не сохранять** состояние Turbo в `localStorage`

## Implementation
- **UI**: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Добавлена кнопка `TURBO` в верхней панели.
  - Переключение отключено при `isBusy`, чтобы не менять скорость “на лету”.
  - На корневой контейнер навешивается класс `repoker-turbo` при включённом Turbo.
- **Тайминги (JS)**: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`
  - Добавлен `turboEnabled`.
  - Для каскада введены `timeFactor/scaleMs()` и масштабирование задержек в `schedule()`.
  - Ускорены задержки `dealing` (инкрементальная раздача) и `suspense` (переход к вычислению/каскаду).
- **Анимации (CSS)**: `src/balatroInferno.css`
  - Добавлен `.repoker-turbo { --repoker-time-factor: 0.5; }`.
  - На `--repoker-time-factor` переведены только:
    - `animate-cascade-vanish`
    - `animate-cascade-appear`
    - `animate-cascade-refill-flash`
    - `animate-cascade-mult-pop`
- **Карты (transition)**: `src/ui/screens/balatro-inferno/components/Card.jsx`
  - `transitionDuration/transitionDelay` привязаны к `--repoker-time-factor`, чтобы ускорить “появление/пересдачу” без ускорения бесконечных декоративных анимаций.

## Testing
- `npm run test` — ✅ (24/24)
- `npm run lint` — ✅
- `npm run build` — ✅
Примечание: в sandbox окружении были `EPERM` ошибки у `vitest/eslint`, поэтому test/lint запускались вне sandbox.

## Lessons learned
- Единый `timeFactor` для JS-таймлайна + CSS‑переменная для точечного ускорения — простой и управляемый подход.
- Запрет переключения Turbo во время анимаций (`isBusy`) снижает риск рассинхронов и “гонок” таймеров.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-turbo-button.md`


