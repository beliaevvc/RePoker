/**
 * Файл: src/ui/screens/balatro-inferno/constants.js
 * Слой: ui
 * Назначение: UI-константы и темы для визуальных эффектов экрана BalatroInferno.
 *
 * Инварианты:
 * - Значения должны оставаться 1:1 со старыми (из монолита `src/BalatroInferno.jsx`), пока мы сохраняем поведение.
 */

export const TIER_COLORS = {
  0: { flame: 'from-slate-700 to-slate-900', text: 'text-white' },
  1: { flame: 'from-blue-500 via-indigo-500 to-purple-500', text: 'text-blue-200' },
  2: { flame: 'from-emerald-400 via-green-500 to-teal-600', text: 'text-emerald-200' },
  3: { flame: 'from-fuchsia-500 via-purple-600 to-indigo-600', text: 'text-fuchsia-200' },
  4: { flame: 'from-orange-500 via-red-500 to-yellow-500', text: 'text-amber-200' },
  5: { flame: 'from-rose-500 via-red-600 to-orange-600', text: 'text-rose-200' }, // 3 Jokers
  6: { flame: 'from-purple-600 via-pink-600 to-red-600', text: 'text-purple-100' }, // 4 Jokers
  7: { flame: 'from-yellow-400 via-orange-500 to-red-600', text: 'text-yellow-100' }, // 5 Jokers (MAX WIN)
}


