# Creative: Cascade Win History

## 1. Контекст и проблема
В режиме **CASCADE** игрок может совершить серию выигрышей (10+ шагов). Сейчас он видит только текущий выигрыш и итоговую сумму.
**Потребность**: Игрок хочет видеть "как это случилось" — какие комбинации выпали, какие множители сработали, особенно если был Jackpot или крупный занос.
**Задача**: Показать историю шагов красиво, компактно, читаемо, в стиле игры.

## 2. Архитектура данных
В `useBalatroInfernoController` добавляем стейт `cascadeWinHistory` (массив).
Структура записи (`CascadeHistoryEntry`):
```typescript
{
  stepIndex: number;      // 0-based индекс шага в логике
  winStepNumber: number;  // 1-based номер выигрышного шага (для UI)
  comboName: string;      // "Pair", "Full House" и т.д.
  comboSignature: string; // "K K J*" (для логов/доп. инфо)
  winningIndices: number[]; // индексы карт (0..4), которые сыграли
  hand: Card[];           // 5 карт, которые были на столе в момент проверки
  baseWinAmount: number;  // выигрыш до множителя каскада
  cascadeMultiplier: number; // множитель шага (x1, x2...)
  winAmount: number;      // итоговый выигрыш шага (base * mult)
  jackpotAmount: number;  // если выпал джекпот
}
```
Сброс истории: при `resetCascade` (начало новой раздачи).

## 3. UI / UX Решения

### 3.1. Триггер (Точка входа)
В компоненте `CascadeMultiplierIndicator` уже есть строка `WIN {amount}`.
Мы добавляем кнопку **справа** от суммы (или на той же строке).
**Вид**:
- Текст: `WINS ({count})` или иконка списка + `({count})`.
- Стиль:
  - `text-[10px] uppercase tracking-widest`
  - Цвет: `text-slate-400 hover:text-white transition-colors cursor-pointer`
  - Подчеркивание или border-bottom для аффорданса кликабельности.
- Условие: Показывается, только если `history.length > 0`.

### 3.2. Overlay (Просмотр)
Используем **Modal** (по центру), аналогично `AutoPlayModal`, но с возможностью скролла контента.
- **Заголовок**: `CASCADE HISTORY`
- **Total**: `TOTAL WIN: {amount}` (крупно, в золоте/белом)
- **Контент**: Вертикальный список (`flex-col gap-2`), скроллируемый (`max-h-[60vh] overflow-y-auto`).
- **Фон**: Затемнение + блюр, модалка в стиле "Pixel board".

### 3.3. Элемент списка (Row)
Каждый шаг — это карточка/блок.
**Layout**:
1.  **Header (Верхняя строка)**:
    - Слева: `STEP {N} · {COMBO_NAME}` (белый/золотой)
    - Справа: `+{amount} (x{mult})` (зеленый/яркий)
2.  **Cards (Нижняя строка)**:
    - Ряд из 5 **MiniCards**.
    - Выравнивание: по левому краю или по центру (лучше по левому/центру, чтобы было аккуратно).
    - Если был Jackpot: отдельная яркая строка `JACKPOT +{amount}` под картами.

### 3.4. MiniCard (Мини-карты)
Полноценные карты (`Card.jsx`) слишком велики и сложны для списка. Нужен `MiniCard.jsx`.
**Specs**:
- **Размер**: Ширина ~32px, Высота ~44px (aspect ~2:3).
- **Стиль**:
  - Border: 1px (solid).
  - Background: Slate-800 (темный) или Slate-200 (светлый, как у больших).
  - **Content**:
    - Rank (Top-Left or Center): font-press-start, size ~10px.
    - Suit (Center or Bottom-Right): Pixel Icon, size ~12px.
- **Состояния**:
  - **Winning**: Яркий фон (или светлый), яркий бордер (золотой/белый), полная непрозрачность.
  - **Non-winning**: Затемненные (`opacity-40 grayscale`), без акцента.
- **Joker**:
  - Особый стиль (фиолетовый/золотой фон), иконка короны.

## 4. План реализации

### Phase 1: Data & Controller
1.  В `useBalatroInfernoController`: добавить `cascadeHistory` (state).
2.  В `useEffect` (где `step.didWin`): пушить новую запись в историю.
3.  Очистка истории в `resetCascade`.

### Phase 2: MiniCard Component
1.  Создать `src/ui/screens/balatro-inferno/components/MiniCard.jsx`.
2.  Использовать `PixelSuit` (существующий).
3.  Реализовать пропсы `isWinning`, `isJoker`.

### Phase 3: CascadeHistoryModal
1.  Создать `src/ui/screens/balatro-inferno/components/CascadeHistoryModal.jsx`.
2.  Взять за основу стили `AutoPlayModal`.
3.  Реализовать рендер списка истории.

### Phase 4: Integration
1.  В `CascadeMultiplierIndicator`: добавить кнопку-триггер, прокинуть колбэк `onOpenHistory`.
2.  В `BalatroInferno`: подключить модалку, состояние открытия (`historyModalOpen`).

