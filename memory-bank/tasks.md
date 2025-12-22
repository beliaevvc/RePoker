# Задачи (Memory Bank)

## Текущая задача
- **UI (mobile/узкие):** поправить адаптив шапки в `BalatroInferno` — сильнее уменьшать “MAX WIN 150.000x” и устранить обрезание суммы в плашке **CHIPS** на iPhone (Safari/Chrome) и узких разрешениях.

## Сложность
- Level 2

## План
- **Где правим**
  - `src/ui/screens/balatro-inferno/BalatroInferno.jsx` — шапка `grid grid-cols-3` (CHIPS / MAX WIN / ANTE) и компонент `MaxWinPoster`.
  - `src/ui/screens/balatro-inferno/moneyFormat.js` — при необходимости, сделать `formatMoneyAdaptive` более “мобильным” (раньше переходить в compact), чтобы суммы реже резались.

- **Что делаем**
  - **MAX WIN**: уменьшить типографику именно на mobile/узких (база), потому что сейчас `clamp()` имеет слишком большой `min` и на ширинах <640px не сжимается.
  - **CHIPS/ANTE**: уменьшить `min` в `clamp()` для суммы на mobile + добавить безопасные правила переполнения (ellipsis/clip) и/или более агрессивный `formatMoneyAdaptive` на mobile.
  - **Проверка**: прогнать визуально в devtools на 320/360/390/430px и убедиться, что на desktop внешний вид не деградировал.

- **Критерии успеха**
  - На iPhone (Safari/Chrome) “MAX WIN 150.000x” **заметно меньше** и не пересекается с CHIPS/ANTE.
  - Сумма в **CHIPS** и **ANTE** не обрезается “некрасиво”: либо полностью видна, либо компактно сокращена, при этом полное значение доступно через `title`.
  - Никаких layout jumps/перекосов сетки в шапке при переключении режимов/результатах.

- **Риски/неизвестные**
  - `skew` съедает полезную ширину, поэтому длинные валютные строки могут резаться даже при уменьшении шрифта — вероятно, потребуется более ранний переход в compact на mobile.
  - Реальное поведение на iOS может отличаться от Chrome devtools (safe-area/шрифты) — ориентируемся на реальные устройства.

## Чеклист
- [x] Найти разметку шапки (grid `CHIPS / MAX WIN / ANTE`) в `src/ui/screens/balatro-inferno/BalatroInferno.jsx`.
- [x] MAX WIN (в шапке): уменьшить `min` в `clamp()` и/или добавить mobile-правила (base vs `sm:`) для `MaxWinPoster`.
- [x] CHIPS/ANTE: уменьшить `min` в `clamp()` на mobile, добавить `text-ellipsis`/`min-w-0`/`max-w-full` где нужно.
- [x] Если всё ещё режется: на mobile вызывать `formatMoneyAdaptive(balance, { maxFullLength: ... , compactFrom: ... })`.
- [x] Визуально проверить 320/360/390/430px + iPhone; прогнать `npm run lint` и `npm run build`.

---

## Последние завершённые
- (завершено) UI: Paytable — добавлен блок “DECK CLEAR” (без слова jackpot) с условием полной очистки 54‑картной колоды за 1 каскад и выплатой **150.000x**; унифицирован формат **150.000x** в MAX WIN оверлеях (`archive-2025-12-23-deck-clear-paytable.md`).
- (завершено) UI: Paytable Modal — таблица выплат с примерами рук (миниатюры с подсветкой) и возможностью менять ставку (+/-) для просмотра потенциальных выигрышей. Триггер в верхней панели (`archive-2025-12-23-paytable.md`).
- (завершено) UI/CASCADE: история выигрышей каскада — `WINS (N)` + модалка (scroll) + mini-cards + блокировка во время каскада (`archive-2025-12-23-cascade-win-history.md`)
- (завершено) UI (CASCADE): running `WIN` под `CASCADE MULT` + анимация инкремента + показ на финале + без layout jump (`archive-2025-12-23-cascade-running-win.md`)
- (завершено) Баланс: Pair payout 0.3x → 0.2x (`archive-2025-12-23-pair-0.2x.md`)
- (завершено) UI/UX CASCADE: preview множителя (current/next) + **x1 всегда горит** (OFF убран).
- (завершено) UI: “MAX WIN 150.000x” — вернуть золотой стиль с переливом (починить/добавить `text-gold-shimmer`).
- (завершено) AutoPlay: модалка выбора автоспинов + авто-цикл + счётчик на PLAY + STOP на AUTO + pixel/CRT стиль + shake.
- (завершено) Dev Mode: DevTools — раздел “Добавить денег” (кнопки +1000/+5000/+10000/+100000/+1m/+10m) + безопасный handler + dev-log.
- (завершено) UI: плашка CHIPS — overflow больших сумм (adaptive формат + tooltip, без переносов).
- (завершено) UI: увеличить высоту блока нижних кнопок (TURBO/PLAY/AUTO/+/-) и затем уменьшить на ~10% по фидбэку.
- (завершено) UI: `MaxWinPoster` на full desktop — ограничить раздувание и косметика “150.000x” (x меньше, больше воздуха).
