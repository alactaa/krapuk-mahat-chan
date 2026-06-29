export default function GoalCard({ goal, balance }) {
  const pct = Math.min(100, Math.round((balance / goal.target_amount) * 100))
  const remain = Math.max(0, goal.target_amount - balance)

  return (
    <div className="glass-card mx-4 mb-3 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.emoji}</span>
          <span className="text-sm font-medium">{goal.name}</span>
        </div>
        <span className="text-xs text-white/50">🚀 {pct}%</span>
      </div>
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00C853, #69F0AE)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-white/50">{balance.toLocaleString()} ฿</span>
        <span className="text-xs text-white/50">
          {remain > 0 ? `เหลืออีก ${remain.toLocaleString()} ฿` : '🎉 ถึงเป้าแล้ว!'}
        </span>
      </div>
    </div>
  )
}
