/**
 * Пиксельные иконки для UI-кнопок (Turbo / Auto).
 * Важно: делаем максимально “крисп” через rect + shapeRendering.
 */
export function PixelLightningIcon({ active = false, className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={[active ? 'text-yellow-300' : 'text-slate-200', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      focusable="false"
      style={{ imageRendering: 'pixelated' }}
    >
      <g shapeRendering="crispEdges" fill="currentColor">
        {/* Молния (высота 10px, отступ сверху 3px) - точно не обрежется */}
        <path d="
          M9 3 H11 V7 H13 L7 13 V8 H5 L9 3 Z
        " />
      </g>
    </svg>
  )
}

export function PixelAutoIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ imageRendering: 'pixelated' }}
    >
      <g shapeRendering="crispEdges" fill="currentColor">
        {/* Символ бесконечности (Infinity loop) */}
        {/* Левое кольцо */}
        <rect x="2" y="6" width="1" height="4" />
        <rect x="3" y="5" width="2" height="1" />
        <rect x="3" y="10" width="2" height="1" />
        <rect x="5" y="6" width="1" height="1" />
        <rect x="5" y="9" width="1" height="1" />
        
        {/* Пересечение */}
        <rect x="6" y="7" width="1" height="2" />
        <rect x="7" y="8" width="2" height="1" />
        <rect x="9" y="7" width="1" height="2" />

        {/* Правое кольцо */}
        <rect x="10" y="6" width="1" height="1" />
        <rect x="10" y="9" width="1" height="1" />
        <rect x="11" y="5" width="2" height="1" />
        <rect x="11" y="10" width="2" height="1" />
        <rect x="13" y="6" width="1" height="4" />
      </g>
    </svg>
  )
}

/**
 * Пиксельная "монетка" для PAYTABLE (вместо обычного emoji).
 * 16x16, crispEdges.
 */
export function PixelMoneyIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      className={className}
      aria-hidden="true"
      focusable="false"
      style={{ imageRendering: 'pixelated' }}
    >
      <g shapeRendering="crispEdges" fill="currentColor">
        {/* внешнее кольцо */}
        <rect x="5" y="2" width="6" height="1" />
        <rect x="4" y="3" width="1" height="1" />
        <rect x="11" y="3" width="1" height="1" />
        <rect x="3" y="4" width="1" height="2" />
        <rect x="12" y="4" width="1" height="2" />
        <rect x="2" y="6" width="1" height="4" />
        <rect x="13" y="6" width="1" height="4" />
        <rect x="3" y="10" width="1" height="2" />
        <rect x="12" y="10" width="1" height="2" />
        <rect x="4" y="12" width="1" height="1" />
        <rect x="11" y="12" width="1" height="1" />
        <rect x="5" y="13" width="6" height="1" />

        {/* внутренний "блик" */}
        <rect x="6" y="5" width="1" height="1" />
        <rect x="7" y="4" width="2" height="1" />
        <rect x="6" y="6" width="1" height="1" />

        {/* символ $ (упрощённый) */}
        <rect x="8" y="6" width="1" height="5" />
        <rect x="7" y="6" width="2" height="1" />
        <rect x="7" y="8" width="2" height="1" />
        <rect x="7" y="10" width="2" height="1" />
      </g>
    </svg>
  )
}


