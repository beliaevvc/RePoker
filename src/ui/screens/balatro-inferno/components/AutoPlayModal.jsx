import { X } from 'lucide-react'
import { useState } from 'react'

const PRESETS = [10, 25, 50, 100, 500, 1000]

function PresetButton({ active, disabled, onClick, children, title }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={[
        'w-full h-[48px] border-2 font-black tracking-[0.18em] uppercase text-[12px] relative group',
        'active:translate-y-[4px] transition-none', // instant press
        disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:brightness-110 cursor-pointer',
        active
          ? 'bg-orange-600 text-white border-orange-300 shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0'
          : 'bg-slate-800 text-slate-300 border-slate-600 shadow-[4px_4px_0_#000] active:shadow-none translate-x-[-2px] translate-y-[-2px] active:translate-x-0 active:translate-y-0',
      ].join(' ')}
    >
      {/* Scanline overlay for button */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export function AutoPlayModal({
  open,
  running,
  isBusy,
  canStart,
  selectedCount,
  onSelectPreset,
  onStart,
  onClose,
}) {
  const [shakeClass, setShakeClass] = useState('')

  if (!open) return null

  const triggerShake = (type = 'violent') => {
    setShakeClass(type === 'ultra' ? 'animate-shake-ultra' : 'animate-shake-violent')
    // Reset after animation
    setTimeout(() => setShakeClass(''), type === 'ultra' ? 300 : 200)
  }

  const handleSelectPreset = (n) => {
    if (running) return
    onSelectPreset(n)
    triggerShake('violent')
  }

  const handleStart = () => {
    triggerShake('ultra')
    // Small delay to let the shake start before closing (if desired) or just visual feedback
    // Since onStart() usually closes modal immediately or starts action, we want the shake to be visible.
    // If the modal closes, the shake won't be seen on the modal itself, but we can shake it before closing logic runs in parent?
    // Actually, onStart passed from parent closes the modal.
    // To see the shake, we might need the parent to delay closing or just enjoy the click effect.
    // But user requirement is "shake modal". If modal closes instantly, shake is missed.
    // Let's assume onStart logic in parent closes it.
    // For now, I'll just trigger it. If it closes instantly, we might need to delay onStart call.
    // Let's delay the onStart call by 150ms to show the impact.
    setTimeout(() => {
      onStart()
    }, 150)
  }

  const startDisabled = running || !canStart || isBusy
  const hint =
    running
      ? 'AUTO STARTED'
      : !canStart
        ? 'NOT ENOUGH CHIPS'
        : isBusy
          ? 'WAIT FOR FINISH'
          : 'SELECT AMOUNT'

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[1300] bg-black/60 backdrop-blur-[2px]"
        aria-label="Close AutoPlay modal"
        onClick={onClose}
      />

      <div
        className={[
          'fixed inset-x-0 bottom-0 z-[1400] pb-safe',
          'sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:top-[clamp(120px,18vh,240px)]',
          shakeClass, // Dynamic shake class
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="AutoPlay"
      >
        <div
          className={[
            'w-full sm:w-[min(92vw,520px)]',
            'bg-[#1a1a2e] border-[4px] border-slate-500',
            'shadow-[12px_12px_0_rgba(0,0,0,0.8)]',
            'p-1',
          ].join(' ')}
        >
          {/* Inner CRT container */}
          <div className="relative bg-[#050510] border-2 border-slate-700 p-4 sm:p-6 overflow-hidden">
            {/* CRT Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-40" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div className="min-w-0 flex-1">
                  <div className="inline-block relative">
                     {/* Glitch title effect */}
                    <div className="absolute -inset-1 bg-red-500/20 blur-sm animate-pulse" />
                    <div className="relative border-l-4 border-orange-500 pl-3">
                      <div className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.3em] mb-1">AUTO MODE</div>
                      <div className="text-2xl sm:text-3xl text-white font-black tracking-widest uppercase leading-none drop-shadow-[2px_2px_0_rgba(255,0,0,0.5)]">
                        AUTOSPINS
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className={[
                    'w-[40px] h-[40px] bg-slate-800 border-2 border-slate-600',
                    'hover:bg-slate-700 hover:border-slate-400',
                    'active:bg-red-900/50 active:border-red-500',
                    'text-slate-200 flex items-center justify-center transition-none',
                    'shadow-[4px_4px_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]'
                  ].join(' ')}
                  title="CLOSE"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
                {PRESETS.map((n) => (
                  <PresetButton
                    key={n}
                    active={selectedCount === n}
                    disabled={running}
                    onClick={() => handleSelectPreset(n)}
                    title={running ? 'LOCKED' : `SET: ${n}`}
                  >
                    {n}
                  </PresetButton>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={startDisabled}
                  onClick={handleStart}
                  className={[
                    'w-full h-[64px] font-black tracking-[0.25em] uppercase text-xl relative overflow-hidden group',
                    'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500', // PLAY gradient
                    'border-b-[8px] border-[#7f1d1d] rounded-lg', // PLAY border & radius
                    'shadow-[0_8px_16px_rgba(220,38,38,0.3)]', // PLAY shadow style
                    'active:border-b-0 active:translate-y-[8px] active:shadow-none transition-all', // PLAY press mechanics
                    'disabled:filter disabled:grayscale disabled:cursor-not-allowed opacity-100' // PLAY disabled style
                  ].join(' ')}
                >
                   {/* PLAY shine effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                   
                   <span className="relative z-10 drop-shadow-md text-white">START</span>
                </button>

                <div className="text-center bg-black/40 border border-white/10 p-2 mt-1">
                  <div className="text-[10px] sm:text-[11px] text-orange-200 font-mono uppercase tracking-[0.15em] animate-pulse">
                    &gt; {hint} <span className="animate-blink">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
