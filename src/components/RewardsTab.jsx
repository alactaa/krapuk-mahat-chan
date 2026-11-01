import { localDateStr, txDate } from '../lib/tx'

const STREAK_STEPS = [7, 30, 60, 100, 200, 365]
const SAVING_STEPS = [500, 1000, 2000, 5000, 10000, 20000]

function BadgeTrack({ title, icon, steps, value, fmt }) {
  const earned = steps.filter((s) => value >= s).length
  const next = steps.find((s) => value < s)
  const prev = steps.filter((s) => value >= s).pop() || 0
  const pct = next ? Math.round(((value - prev) / (next - prev)) * 100) : 100

  return (
    <div className="glass-card mx-4 mb-3 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white/80">{icon} {title}</span>
        <span className="text-xs text-white/50">{earned}/{steps.length}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {steps.map((s) => {
          const got = value >= s
          return (
            <div
              key={s}
              className={`rounded-2xl py-3 flex flex-col items-center gap-1 ${got ? 'bg-white/15' : 'bg-white/5 opacity-40'}`}
            >
              <span className="text-2xl">{got ? icon : '🔒'}</span>
              <span className="text-xs font-medium">{fmt(s)}</span>
            </div>
          )
        })}
      </div>
      {next ? (
        <>
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FFD600, #FF9100)' }}
            />
          </div>
          <p className="text-xs text-white/50 mt-1.5 text-center">
            อีก {fmt(Math.ceil(next - value))} จะได้เหรียญ {fmt(next)}
          </p>
        </>
      ) : (
        <p className="text-xs text-center text-[#FFD600]">🏆 ได้ครบทุกเหรียญแล้ว!</p>
      )}
    </div>
  )
}

export default function RewardsTab({ kid, transactions, goals }) {
  const streak = Number(kid?.streak || 0)
  const balance = Number(kid?.balance || 0)
  // เอาไปฝากธนาคารแล้วต้องไม่เสียเหรียญ — นับรวมเป็นเงินออม
  const saved = balance + Number(kid?.bank_total || 0)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 6)
  const weekStart = localDateStr(weekAgo)

  const specials = [
    { icon: '⭐', label: 'ได้โบนัสเดือนนี้', got: transactions.some((tx) => tx.type === 'bonus') },
    { icon: '🛡️', label: '7 วันไม่ใช้เงิน', got: !transactions.some((tx) => tx.type === 'withdraw' && txDate(tx) >= weekStart) },
    { icon: '🏦', label: 'ฝากธนาคาร', got: saved > balance || transactions.some((tx) => tx.type === 'bank') },
    { icon: '💜', label: 'ไม่มีหนี้ค้าง', got: !(kid?.loans || []).some((l) => l.status === 'active') },
    { icon: '🎯', label: 'มีเป้าหมาย', got: goals.length > 0 },
    { icon: '🏁', label: 'ถึงเป้าหมาย', got: goals.some((g) => saved >= Number(g.target_amount)) },
  ]

  const total = STREAK_STEPS.length + SAVING_STEPS.length + specials.length
  const earned =
    STREAK_STEPS.filter((s) => streak >= s).length +
    SAVING_STEPS.filter((s) => saved >= s).length +
    specials.filter((b) => b.got).length

  return (
    <div className="pt-4">
      <div className="glass-card mx-4 mb-3 p-5 text-center">
        <p className="text-5xl mb-2">🏆</p>
        <p className="text-sm text-white/60">เหรียญที่ได้แล้ว</p>
        <p className="text-3xl font-bold mt-1">
          {earned} <span className="text-base text-white/40 font-medium">/ {total}</span>
        </p>
      </div>

      <BadgeTrack title="ออมติดต่อกัน" icon="🔥" steps={STREAK_STEPS} value={streak} fmt={(n) => `${n.toLocaleString()} วัน`} />
      <BadgeTrack title="เงินออมทั้งหมด" icon="💰" steps={SAVING_STEPS} value={saved} fmt={(n) => `${n.toLocaleString()} ฿`} />

      <div className="glass-card mx-4 mb-3 p-4">
        <h3 className="text-sm font-medium text-white/80 mb-3">✨ เหรียญพิเศษ</h3>
        <div className="grid grid-cols-3 gap-2">
          {specials.map((b) => (
            <div
              key={b.label}
              className={`rounded-2xl py-3 px-1 flex flex-col items-center gap-1 text-center ${b.got ? 'bg-white/15' : 'bg-white/5 opacity-40'}`}
            >
              <span className="text-2xl">{b.got ? b.icon : '🔒'}</span>
              <span className="text-[11px] leading-tight font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
