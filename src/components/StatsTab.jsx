import SavingsChart from './SavingsChart'
import { TYPE_META, txDate } from '../lib/tx'

const PERIOD_DAYS = 30 // ตรงกับ days ที่ api.getAll ดึงมา

function StatBox({ icon, label, value, color }) {
  return (
    <div className="glass-card p-3 flex flex-col gap-1">
      <span className="text-xs text-white/50">{icon} {label}</span>
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

function moodFor(net, income) {
  if (income <= 0) return '🌱 เริ่มเก็บเงินกันเลย!'
  const kept = net / income
  if (kept >= 0.8) return '🤩 เก็บไว้ได้เกือบหมด สุดยอดไปเลย!'
  if (kept >= 0.5) return '😊 เก็บได้มากกว่าครึ่ง เก่งมาก!'
  if (kept >= 0) return '🙂 ยังเหลือเก็บอยู่ ลองใช้น้อยลงอีกนิดนะ'
  return '🤔 ช่วงนี้เงินออกมากกว่าเงินเข้า'
}

export default function StatsTab({ transactions }) {
  const txs = transactions || []
  const sumOf = (types) =>
    txs.filter((tx) => types.includes(tx.type)).reduce((s, tx) => s + Number(tx.amount), 0)

  const income = sumOf(['daily', 'deposit', 'bonus'])
  const out = sumOf(['withdraw'])
  const net = income - out
  const keptPct = income > 0 ? Math.max(0, Math.min(100, Math.round((net / income) * 100))) : 0

  const withdraws = txs.filter((tx) => tx.type === 'withdraw')
  const spendDays = new Set(withdraws.map(txDate)).size
  const topOut = [...withdraws].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5)

  const byType = Object.keys(TYPE_META)
    .map((type) => ({
      type,
      total: sumOf([type]),
      count: txs.filter((tx) => tx.type === type).length,
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.total - a.total)
  const maxTotal = Math.max(1, ...byType.map((r) => r.total))

  return (
    <div className="pt-4">
      <SavingsChart transactions={txs} />

      <div className="glass-card mx-4 mb-3 p-4">
        <h3 className="text-sm font-medium text-white/80 mb-3">📊 สรุป {PERIOD_DAYS} วันล่าสุด</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatBox icon="⬆️" label="เงินเข้า" value={`+${income.toLocaleString()} ฿`} color="#00C853" />
          <StatBox icon="⬇️" label="เงินออก" value={`-${out.toLocaleString()} ฿`} color="#FF5252" />
          <StatBox icon="🛡️" label="วันที่ไม่ใช้เงิน" value={`${PERIOD_DAYS - spendDays} วัน`} color="#69F0AE" />
          <StatBox icon="🛒" label="ใช้เงิน" value={`${withdraws.length} ครั้ง`} color="#FFAB40" />
        </div>
        <div className="flex justify-between text-xs text-white/60 mb-1.5">
          <span>เก็บไว้ได้</span>
          <span>{keptPct}% ของเงินเข้า</span>
        </div>
        <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{ width: `${keptPct}%`, background: 'linear-gradient(90deg, #00C853, #69F0AE)' }}
          />
        </div>
        <p className="text-xs text-center mt-3 text-white/70">{moodFor(net, income)}</p>
      </div>

      {byType.length > 0 && (
        <div className="glass-card mx-4 mb-3 p-4">
          <h3 className="text-sm font-medium text-white/80 mb-3">🧾 แยกตามประเภท</h3>
          <div className="space-y-2.5">
            {byType.map((r) => {
              const meta = TYPE_META[r.type]
              return (
                <div key={r.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{meta.icon} {meta.label} · {r.count} ครั้ง</span>
                    <span className="font-medium" style={{ color: meta.color }}>
                      {meta.sign}{r.total.toLocaleString()} ฿
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(r.total / maxTotal) * 100}%`, background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="glass-card mx-4 mb-3 p-4">
        <h3 className="text-sm font-medium text-white/80 mb-3">🛒 เงินออกก้อนใหญ่สุด</h3>
        {topOut.length === 0 ? (
          <p className="text-center text-white/30 text-sm py-2">ไม่ได้ใช้เงินเลย เก่งมาก! 🎉</p>
        ) : (
          <div className="space-y-2">
            {topOut.map((tx, i) => (
              <div key={tx.tx_id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-white/40 w-4">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{String(tx.note || '').trim() || 'ใช้เงิน'}</p>
                    <p className="text-xs text-white/40">{txDate(tx).split('-').reverse().slice(0, 2).map(Number).join('/')}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#FF5252] shrink-0">-{Number(tx.amount).toLocaleString()} ฿</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
