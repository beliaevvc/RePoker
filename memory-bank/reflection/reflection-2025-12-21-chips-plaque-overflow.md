# Reflection — UI: CHIPS overflow (adaptive money display)

## Контекст задачи
Плашка **CHIPS** в `BalatroInferno` ломалась на больших значениях: число визуально “вылазило” за границы. Ограничения: **без переноса строки**, ширина блока **фиксированная**.

## План vs факт
- **Планировали**: adaptive формат (full пока помещается, иначе compact) + tooltip с full, единый helper для форматирования.
- **Сделали**: ровно так — добавили helper `formatMoneyFull/Compact/Adaptive`, подключили в `BalatroInferno` и унифицировали DevTools.

## Что сделали (по делу)
- Добавили `src/ui/screens/balatro-inferno/moneyFormat.js`:
  - `formatMoneyFull` — стабильный full-формат валюты.
  - `formatMoneyCompact` — компактный `K/M/B/...`.
  - `formatMoneyAdaptive` — переключение в compact для больших значений/длинной строки.
- В `src/ui/screens/balatro-inferno/BalatroInferno.jsx`:
  - CHIPS теперь показывает **adaptive** значение, а `title` всегда содержит **полное**.
  - Добавлены `whitespace-nowrap` и `overflow-hidden` как guardrails (без переноса).
- В `src/ui/screens/balatro-inferno/components/DevToolsDrawer.jsx`:
  - Формат денег переведён на общий helper (единый вид сумм).

## Что было сложным / почему
- Нужно было выбрать UX, который сохраняет “вау” от полного баланса, но не ломает верстку. Компромисс: **compact в UI + full в tooltip**.
- В sandbox окружении `eslint` падал с `EPERM` при чтении `node_modules`. Решение: прогон гейтов **вне sandbox** и фиксация этого факта в `progress.md`.

## Что сработало хорошо
- **Adaptive** форматирование решает overflow без измерения текста/DOM и без переносов.
- Общий helper уменьшает дублирование и риск расхождения форматов между UI и DevTools.

## Что можно улучшить в процессе
- Сразу договориться о точных порогах перехода в compact (например, от какого значения/длины), чтобы не перебирать визуально.
- Если захотим “всегда full”: потребуется более сложный подход (shrink-to-fit через измерение `scrollWidth/clientWidth` или `canvas.measureText`) — это стоит отдельно планировать/тестировать.


