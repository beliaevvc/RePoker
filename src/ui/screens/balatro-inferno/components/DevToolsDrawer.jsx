import { useCallback, useMemo, useState } from 'react'

function formatTs(ts) {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString(undefined, { hour12: false })
  } catch {
    return String(ts)
  }
}

function formatMoney(n) {
  const v = Number(n || 0)
  if (Number.isNaN(v)) return String(n)
  return `$${v.toFixed(2)}`
}

function formatMode(mode) {
  return mode === 'cascade' ? 'CASCADE' : 'NORMAL'
}

function formatGameState(state) {
  switch (state) {
    case 'idle':
      return 'ожидание'
    case 'dealing':
      return 'раздача'
    case 'suspense':
      return 'проверка'
    case 'cascading':
      return 'каскад'
    case 'result':
      return 'результат'
    default:
      return String(state ?? '')
  }
}

function formatLogMessage(entry) {
  const type = entry?.type
  const p = entry?.payload ?? {}

  switch (type) {
    case 'DEAL_START':
      return `PLAY: ставка ${formatMoney(p.bet)}`
    case 'DEAL_STARTED':
      return `Раздача началась (deck=${p.deckLen ?? '?'}, idx=${p.dealIndex ?? '?'})`
    case 'BET_CHANGE':
      return `Ставка: ${formatMoney(p.from)} → ${formatMoney(p.to)}`
    case 'MODE_CHANGE':
      return `Режим: ${formatMode(p.from)} → ${formatMode(p.to)}`
    case 'TURBO_TOGGLE':
      return `Turbo: ${p.enabled ? 'ON' : 'OFF'}`
    case 'DEBUG_TOGGLE':
      return `Debug overlay: ${p.enabled ? 'ON' : p.enabled === false ? 'OFF' : 'toggle'}`
    case 'JACKPOT_SIM_START':
      return `JP SIM: запуск (ставка ${formatMoney(p.bet)})`
    case 'JACKPOT_SIM_SCENARIO':
      return `JP SIM: сценарий #${(p.scenarioIdx ?? 0) + 1}`
    case 'RESULT_RESOLVED': {
      const name = p.name ?? '—'
      const winAmount = Number(p.winAmount ?? 0)
      const combo = p.combo ? ` ${p.combo}` : ''
      return winAmount > 0 ? `Результат: ${name}${combo} +${formatMoney(winAmount)}` : `Результат: ${name}${combo}`
    }
    case 'CASCADE_START':
      return `Каскад: старт (ставка ${formatMoney(p.bet)})`
    case 'CASCADE_STEP': {
      const stepNum = (p.winStepNumber ?? 0) || (p.stepIndex ?? 0) + 1
      if (!p.didWin) return `Каскад: шаг ${stepNum} — конец (нет выигрыша)`
      const win = Number(p.winAmount ?? 0)
      const mult = p.cascadeMultiplier ?? 1
      const jp = Number(p.jackpotAmount ?? 0)
      const combo = p.combo ? ` ${p.combo}` : ''
      const parts = [`Каскад: шаг ${stepNum} — ${p.name ?? 'WIN'}${combo} +${formatMoney(win)} (x${mult})`]
      if (jp > 0) parts.push(`JP +${formatMoney(jp)}`)
      return parts.join(' · ')
    }
    case 'CASCADE_FINISH': {
      const total = Number(p.totalWin ?? 0)
      const jp = Number(p.jackpotAmount ?? 0)
      const reason = p.reason === 'deck-shortage' ? 'колода закончилась' : 'нет выигрыша'
      return jp > 0
        ? `Каскад: завершён (${reason}) — итог +${formatMoney(total)} · JP +${formatMoney(jp)}`
        : `Каскад: завершён (${reason}) — итог +${formatMoney(total)}`
    }
    default:
      return String(type ?? 'EVENT')
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fallback
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Dev Tools drawer / sheet (debug-only UI).
 *
 * @param {{
 *  open: boolean,
 *  variant: 'drawer'|'sheet',
 *  allowed?: boolean,
 *  onEnable?: () => void,
 *  onClose: () => void,
 *  devLogEntries: any[],
 *  devLogPaused: boolean,
 *  onToggleDevLogPaused: () => void,
 *  onClearDevLog: () => void,
 *  onToggleDebugOverlay: () => void,
 *  onRunJackpotSimulation: () => void,
 *  canRunJackpotSimulation: boolean,
 *  stateSnapshot: Record<string, any>,
 * }} props
 */
export function DevToolsDrawer({
  open,
  variant,
  allowed = true,
  onEnable,
  onClose,
  devLogEntries,
  devLogPaused,
  onToggleDevLogPaused,
  onClearDevLog,
  onToggleDebugOverlay,
  onRunJackpotSimulation,
  canRunJackpotSimulation,
  stateSnapshot,
}) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)

  const logText = useMemo(() => {
    return (devLogEntries ?? [])
      .map((e) => `${formatTs(e.ts)} — ${formatLogMessage(e)}`)
      .join('\n')
  }, [devLogEntries])

  const onCopy = useCallback(async () => {
    setCopied(false)
    setCopyError(false)
    const ok = await copyToClipboard(logText)
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } else {
      setCopyError(true)
      window.setTimeout(() => setCopyError(false), 1600)
    }
  }, [logText])

  const panelBase =
    variant === 'sheet'
      ? 'fixed left-0 right-0 bottom-0 z-[900] max-h-[75svh] rounded-t-2xl'
      : 'fixed left-0 top-0 bottom-0 z-[900] w-[min(380px,88vw)]'

  const translate =
    variant === 'sheet'
      ? open
        ? 'translate-y-0 opacity-100'
        : 'translate-y-full opacity-0 pointer-events-none'
      : open
        ? 'translate-x-0 opacity-100'
        : '-translate-x-full opacity-0 pointer-events-none'

  return (
    <>
      <aside
        className={[
          panelBase,
          'bg-[#0b1220]/95 border border-slate-700 shadow-[0_10px_40px_rgba(0,0,0,0.6)]',
          'backdrop-blur-md transition-all duration-200',
          translate,
          variant === 'sheet' ? '' : 'rounded-r-2xl',
        ].join(' ')}
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-violet-900/30 to-transparent">
            <div className="text-[11px] uppercase tracking-[0.28em] text-slate-200">DEV</div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg bg-slate-900/40 border border-slate-700 text-[10px] uppercase tracking-[0.2em] text-slate-200 hover:bg-slate-800/60"
            >
              CLOSE
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
            {!allowed && (
              <section className="border border-amber-600/50 rounded-xl p-3 bg-amber-900/10">
                <div className="text-[10px] uppercase tracking-[0.28em] text-amber-300">Dev tools выключены</div>
                <div className="mt-2 text-[11px] text-slate-200 leading-snug">
                  Чтобы включить Dev Tools в этом билде:
                  <div className="mt-1 font-mono text-[10px] text-slate-300 break-words">
                    - открой страницу с <span className="text-white">?dev=1</span> (или <span className="text-white">?devtools=1</span>)
                    <br />- или нажми кнопку ниже (запишет localStorage и перезагрузит страницу)
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onEnable}
                    disabled={!onEnable}
                    className={[
                      'h-9 px-3 rounded-lg border text-[10px] uppercase tracking-[0.2em]',
                      onEnable
                        ? 'bg-amber-200 text-slate-900 border-amber-300 hover:bg-amber-100'
                        : 'bg-slate-900/20 border-slate-800 text-slate-500 cursor-not-allowed',
                    ].join(' ')}
                  >
                    ВКЛЮЧИТЬ (reload)
                  </button>
                </div>
              </section>
            )}

            {/* Actions */}
            <section className="border border-slate-700 rounded-xl p-3 bg-black/20">
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-300">Действия</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onToggleDebugOverlay}
                  disabled={!allowed}
                  className="h-9 px-3 rounded-lg bg-slate-900/40 border border-slate-700 text-[10px] tracking-[0.12em] text-slate-100 hover:bg-slate-800/60"
                  title="Оверлей (горячая клавиша D)"
                >
                  Оверлей (D)
                </button>
                <button
                  type="button"
                  onClick={onRunJackpotSimulation}
                  disabled={!allowed || !canRunJackpotSimulation}
                  className={[
                    'h-9 px-3 rounded-lg border text-[10px] tracking-[0.12em]',
                    allowed && canRunJackpotSimulation
                      ? 'bg-slate-900/40 border-slate-700 text-slate-100 hover:bg-slate-800/60'
                      : 'bg-slate-900/20 border-slate-800 text-slate-500 cursor-not-allowed',
                  ].join(' ')}
                  title="Симуляция джекпота (только CASCADE)"
                >
                  Симуляция JP
                </button>
              </div>
            </section>

            {/* State */}
            <section className="border border-slate-700 rounded-xl p-3 bg-black/20">
              <div className="text-[10px] uppercase tracking-[0.28em] text-slate-300">Стата</div>
              <div className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-slate-100">
                {[
                  ['Режим', formatMode(stateSnapshot?.mode)],
                  ['Состояние', formatGameState(stateSnapshot?.gameState)],
                  ['Turbo', stateSnapshot?.turbo ? 'ON' : 'OFF'],
                  ['Debug', stateSnapshot?.debug ? 'ON' : 'OFF'],
                  ['Баланс', formatMoney(stateSnapshot?.balance)],
                  ['Ставка', formatMoney(stateSnapshot?.bet)],
                  ['Колода (осталось)', String(stateSnapshot?.deckRemaining ?? 0)],
                  ['Колода (idx)', String(stateSnapshot?.dealIndex ?? 0)],
                  ['Колода (size)', String(stateSnapshot?.deckLen ?? 0)],
                  ['Каскад (шаг)', String(stateSnapshot?.cascadeStepIndex ?? 0)],
                  ['Каскады (последние)', String(stateSnapshot?.lastCascadeStepsCount ?? 0)],
                  ['Джекпот (последний)', stateSnapshot?.lastWasJackpot ? `ДА +${formatMoney(stateSnapshot?.lastJackpotAmount)}` : 'нет'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <div className="text-slate-400">{label}</div>
                    <div className="font-mono text-[10px] text-slate-100">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Log */}
            <section className="border border-slate-700 rounded-xl p-3 bg-black/20">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-300">Лог действий</div>
                <div className="text-[10px] font-mono text-slate-400">
                  {copied ? 'скопировано' : copyError ? 'ошибка копирования' : `${(devLogEntries ?? []).length}`}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onToggleDevLogPaused}
                  disabled={!allowed}
                  className="h-8 px-3 rounded-lg bg-slate-900/40 border border-slate-700 text-[10px] tracking-[0.12em] text-slate-100 hover:bg-slate-800/60"
                >
                  {devLogPaused ? 'Продолжить' : 'Пауза'}
                </button>
                <button
                  type="button"
                  onClick={onClearDevLog}
                  disabled={!allowed}
                  className="h-8 px-3 rounded-lg bg-slate-900/40 border border-slate-700 text-[10px] tracking-[0.12em] text-slate-100 hover:bg-slate-800/60"
                >
                  Очистить
                </button>
                <button
                  type="button"
                  onClick={onCopy}
                  disabled={!allowed}
                  className="h-8 px-3 rounded-lg bg-slate-900/40 border border-slate-700 text-[10px] tracking-[0.12em] text-slate-100 hover:bg-slate-800/60"
                  title="Скопировать текст"
                >
                  Копия
                </button>
              </div>

              <div className="mt-2 max-h-[260px] overflow-y-auto border border-slate-800 rounded-lg bg-black/30">
                {(devLogEntries ?? []).length === 0 ? (
                  <div className="p-3 text-[11px] text-slate-500">пусто</div>
                ) : (
                  <ul className="divide-y divide-slate-800">
                    {(devLogEntries ?? [])
                      .slice()
                      .reverse()
                      .map((e) => (
                        <li key={e.id} className="p-2 text-[11px] text-slate-100">
                          <div className="flex gap-2">
                            <div className="shrink-0 font-mono text-[10px] text-slate-500">{formatTs(e.ts)}</div>
                            <div className="leading-snug">{formatLogMessage(e)}</div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  )
}


