# Глоссарий

## Game / UX

- **Ante / Bet**: ставка на спин. В UI отображается как `ANTE`.
- **Chips / Balance**: баланс игрока. В UI отображается как `CHIPS`.
- **Spin**: один запуск игры по кнопке **PLAY** (включает раздачу и дальнейший результат/каскад).
- **AutoPlay**: режим автоматических спинов (например, AUTO 25).
- **Turbo**: ускоренный таймлайн (быстрее раздача/каскад).
- **MAX WIN**: UX‑оверлей “максимальная выплата” (используется также для джекпот‑синематики).

## Game state (контроллер)

Контроллер: `src/ui/screens/balatro-inferno/useBalatroInfernoController.js`.

- **`gameState`**: текущее состояние экрана:
  - `idle` — ждём PLAY
  - `dealing` — “раздаём” карты по одной
  - `suspense` — пауза перед расчётом/каскадом
  - `cascading` — каскадный таймлайн
  - `result` — финальный экран
- **`mode`**: режим игры (`normal` / `cascade`). Сейчас normal скрыт флагом.

## Cascade (каскад)

- **Cascade**: серия шагов, где выигрышные карты исчезают и заменяются новыми.
- **Cascade step index (`cascadeStepIndex`)**: индекс шага каскада (0‑based) в UI‑таймлайне.
- **Win step number (`winStepNumber`)**: “номер выигрышного шага” (1..N). Важно:
  - это именно номер win‑шага внутри текущего каскада
  - используется для каскадного множителя
- **`cascadeMultiplier`**: множитель выплаты на win‑шаге (см. `src/application/game/cascadeMultiplier.ts`).
- **`winningIndices`**: индексы карт, которые составляют лучшую комбинацию (эти карты исчезают в каскаде).
- **Refill**: фаза, когда в пустые слоты по одному “впрыскиваются” новые карты.
- **Deck shortage (`didDeckShortage`)**: закончилась колода при попытке добора; недостающие карты становятся `null`.
- **Deck clear / Jackpot (`didJackpot`)**: частный случай `deck shortage`, когда после добора рука стала `null×5` и `dealIndex >= deck.length`. Джекпот выплата: **150_000× bet**.

## Data objects

- **Hand**: рука из 5 карт (обычно `Card[]`), на UI может стать `Array<Card | null>` во время deck shortage.
- **Deck**: массив карт (колода).
- **DealIndex**: индекс следующей карты в `deck`.
- **EvalResult**: результат `getBestHand(hand)`:
  - `name` — название комбинации
  - `multiplier` — базовый множитель выплаты
  - `winningIndices` — какие карты “победили”

## Clean Architecture / Tech

- **Domain**: чистая бизнес‑логика (без React/DOM/таймеров).
- **Application**: use‑cases (сценарии).
- **UI**: React и оркестрация.
- **Infrastructure**: адаптеры окружения (RNG/clock).
- **DI (dependency injection)**: передача зависимостей в контроллер (`deps.rng`, `deps.clock`, …) вместо прямых импортов.
- **Port**: интерфейс зависимости (например, RNG) в domain.
- **Adapter**: реализация порта (например, `nativeRng`).
- **Fake clock**: детерминированный clock для тестов (`createFakeClock`).


