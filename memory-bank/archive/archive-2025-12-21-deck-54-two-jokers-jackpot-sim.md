# Archive — 2025-12-21 — Deck 54 (2 Jokers) + Jackpot Sim on Base Deck

## Summary
Обновили состав основной колоды до **52 стандартные карты + 2 джокера = 54**, убрали “chaos/доп‑джокеры”, и перевели `jackpotSimulation` на использование **той же базовой колоды**, чтобы не было расхождений между игрой и debug‑симуляциями.

## Requirements
- Основная колода должна быть **54 карты**: 52 стандартные + 2 джокера.
- `jackpotSimulation` не должен создавать “особую” колоду другого состава/размера/числа джокеров.
- Все проверки должны проходить: `npm run test`, `npm run lint`, `npm run build`.

## Implementation
- **Единый источник истины по составу колоды**:
  - Добавлена функция `createBaseDeck()` в `src/domain/deck/createDeck.ts`.
  - `createDeck()` теперь делает: `createBaseDeck()` → shuffle через `rng`.
- **Состав колоды**:
  - 52 стандартные карты (по 1 копии каждой).
  - +2 джокера.
- **Jackpot simulation**:
  - `src/application/game/debug/jackpotSimulation.ts` теперь импортирует `createBaseDeck()` и строит сценарий на базе основной колоды.
  - Сценарий рассчитан так, чтобы джекпот случался детерминированно через 2 win-шага, опираясь на правило исчерпания (`dealIndex >= deck.length`).

## Testing
- Обновлены unit‑тесты инвариантов колоды: `src/domain/deck/createDeck.test.ts`.
- Прогнаны гейты:
  - `npm run test`
  - `npm run lint`
  - `npm run build`

## Lessons learned
- Формулировки вида “52×2” лучше уточнять сразу: это может означать “две колоды” или “по 2 копии каждой карты”.
- Вынос `createBaseDeck()` сильно снижает риск рассинхрона между core‑механикой и debug/QA инструментами.
- `jackpotSimulation` стоит привязывать к инвариантам (`dealIndex`, `deck.length`), а не к фиксированным размерам “специальной колоды”.

## References
- Reflection: `memory-bank/reflection/reflection-2025-12-21-deck-54-two-jokers-jackpot-sim.md`
- Code:
  - `src/domain/deck/createDeck.ts`
  - `src/domain/deck/createDeck.test.ts`
  - `src/application/game/debug/jackpotSimulation.ts`


