# Archive: AutoPlay (2025-12-21)

## Summary
Добавлена автоигра (AutoPlay) для экрана `BalatroInferno`: модалка выбора количества автоспинов, автозапуск спинов до исчерпания счётчика, индикация оставшихся спинов на `PLAY`, остановка авто на кнопке `AUTO` (текст `STOP`). UI доведён до pixel/CRT-стиля с “ударной” тряской модалки (shake) на выборе пресета и на `START`.

## Requirements
- Открывать окно автоигры по кнопке `AUTO`.
- Выбор количества автоспинов: **10 / 25 / 50 / 100 / 500 / 1000**.
- Кнопка `START` запускает автоигру на выбранное количество.
- Во время авто на главном экране кнопка `AUTO` меняется на **STOP** и останавливает автоигру по клику.
- На кнопке `PLAY` показывать счётчик оставшихся автоспинов (обратный отсчёт).
- Если `CHIPS < ANTE` или игра busy — авто **не запускается/останавливается**.
- Визуальный стиль модалки: **pixel/CRT Balatro** (жёсткие бордеры, CRT-сетка, micro-interactions/shake).

## Implementation
- **Контроллер / оркестрация**
  - Добавлены состояния и actions AutoPlay в `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`.
  - Реализован effect-оркестратор: когда игра в `idle`/`result` и авто активно — запускается следующий спин, а при завершении шага уменьшается счётчик.
  - Добавлены stop-условия: `CHIPS < ANTE`, busy/невозможность старта.
  - Локально отключено правило ESLint `react-hooks/set-state-in-effect` только вокруг оркестратора (осознанно: это управляющий side-effect).

- **UI / модалка**
  - Компонент: `src/ui/screens/balatro-inferno/components/AutoPlayModal.jsx`.
  - Итоговый стиль: pixel/CRT (CRT-сетка, жёсткие рамки), `START` стилизован под кнопку `PLAY` (shine/press).
  - Shake-эффекты:
    - на выбор пресета — `animate-shake-violent`
    - на `START` — `animate-shake-ultra` (сильнее)
  - Тексты UI переведены на английский (AUTOSPINS / SELECT AMOUNT / и т.д.).

- **Интеграция в экран**
  - Экран: `src/ui/screens/balatro-inferno/BalatroInferno.jsx`
  - Кнопка `AUTO` открывает модалку, а во время авто становится `STOP` и останавливает автоигру.
  - На `PLAY` показывается badge с `AUTO N`.

- **CSS**
  - `src/balatroInferno.css`: добавлена анимация `shake-ultra` (`.animate-shake-ultra`).

## Testing
- Гейты (вне sandbox из-за EPERM на чтении `node_modules` в sandbox):
  - `npm run lint` — ✅
  - `npm run test` — ✅ (24/24)
  - `npm run build` — ✅

## Lessons learned
- Для этого проекта “обычные гладкие модалки” визуально не подходят: лучше сразу делать pixel/CRT, иначе всё равно придётся переделывать.
- Micro-interactions (shake/press/shine) критичны для “game feel” — быстро поднимают качество восприятия UI.
- Оркестрация автоигры удобнее и надёжнее через effect, который реагирует на `gameState` (`idle/result`), чем через цепочки таймеров.

## References
- Creative: `memory-bank/creative/creative-autoplay.md`
- Reflection: `memory-bank/reflection/reflection-2025-12-21-autoplay.md`


