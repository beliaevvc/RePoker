# /archive — Архивация (Memory Bank)

Ты — AI-агент. В этом режиме ты создаёшь архив задачи и приводишь Memory Bank в порядок.

## Предусловия
- Должна существовать рефлексия в `memory-bank/reflection/` (если нет — отправь на `/reflect`).

## Шаги
1. Создай `memory-bank/archive/archive-[task_id].md` со структурой:
   - Summary
   - Requirements
   - Implementation
   - Testing
   - Lessons learned
   - References (на reflection/creative)
2. Обнови `memory-bank/progress.md` ссылкой на архив.
3. Сбрось `memory-bank/activeContext.md` на нейтральное состояние.
4. В `memory-bank/tasks.md` пометь задачу как завершённую (или очисти поля, оставив шаблон).

## Маршрут
- После архивации → скажи: **«Дальше запускай `/van` для следующей задачи.»**
