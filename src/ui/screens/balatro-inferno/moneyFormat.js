function toNumberOrNaN(n) {
  return Number(n ?? 0)
}

const FULL_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const COMPACT_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'narrowSymbol',
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
})

export function formatMoneyFull(n) {
  const v = toNumberOrNaN(n)
  if (Number.isNaN(v)) return String(n)
  return FULL_FORMATTER.format(v)
}

export function formatMoneyCompact(n) {
  const v = toNumberOrNaN(n)
  if (Number.isNaN(v)) return String(n)
  return COMPACT_FORMATTER.format(v)
}

/**
 * Adaptive strategy:
 * - show full while it's likely to fit
 * - switch to compact for big magnitudes / long strings
 */
export function formatMoneyAdaptive(n, { compactFrom = 1_000_000, maxFullLength = 12 } = {}) {
  const v = toNumberOrNaN(n)
  if (Number.isNaN(v)) return String(n)

  const full = formatMoneyFull(v)
  if (Math.abs(v) >= compactFrom) return formatMoneyCompact(v)
  if (full.length > maxFullLength) return formatMoneyCompact(v)
  return full
}


