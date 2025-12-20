/**
 * Файл: src/application/game/cascadeMultiplier.ts
 * Слой: application
 * Назначение: правила множителя каскада (применяется к выплате за комбинацию).
 *
 * Правила:
 * - win-step 1 => 1×
 * - win-step 2 => 2×
 * - win-step 3 => 3×
 * - win-step 4+ => 5×
 *
 * Важно:
 * - "win-step" — это номер именно ВЫИГРЫШНОГО шага каскада внутри одного спина.
 * - Если win отсутствует (High Card), каскад заканчивается и множитель не применяется.
 */

export function getCascadeMultiplierForWinStep(winStepNumber: number): number {
  if (!Number.isFinite(winStepNumber) || !Number.isInteger(winStepNumber) || winStepNumber < 1) {
    throw new Error(`winStepNumber должен быть целым числом >= 1, получено: ${winStepNumber}`)
  }

  if (winStepNumber === 1) return 1
  if (winStepNumber === 2) return 2
  if (winStepNumber === 3) return 3
  return 5
}


