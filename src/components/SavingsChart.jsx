import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, Dot,
} from 'recharts'

function getMoodMessage(trend) {
  if (trend < -200) return '😱 เงินลดฮวบเลย! ระวังด้วยนะ! 🙏'
  if (trend < 0) return '😟 เงินลดลงนิดหน่อย ประหยัดกว่านี้ได้นะ 💸'
  if (trend > 300) return '🤩 เยี่ยมมาก! ออมเก่งสุดๆ! 🚀'
  return '😊 เงินเพิ่มขึ้นเรื่อยๆ เก่งมาก! 💪'
}

function CustomDot(props) {
  const { cx, cy, index, dataLength, color } = props
  if (index !== dataLength - 1) return null
  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill={color}
      className="animate-glow-pulse"
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
  )
}

export default function SavingsChart({ transactions }) {
  const [range, setRange] = useState(7)

  const data = useMemo(() => {
    const days = range
    const now = new Date()
    const points = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const label = `${d.getDate()}/${d.getMonth() + 1}`
      const dateStr = d.toISOString().slice(0, 10)
      const txsUpToDate = transactions.filter(
        (tx) => tx.timestamp.slice(0, 10) <= dateStr
      )
      const balance = txsUpToDate.reduce((sum, tx) => {
        const sign = ['deposit', 'daily', 'bonus'].includes(tx.type) ? 1 : -1
        return sum + sign * Number(tx.amount)
      }, 0)
      points.push({ label, balance: Math.max(0, balance) })
    }
    return points
  }, [transactions, range])

  const trend = data.length >= 2
    ? data[data.length - 1].balance - data[data.length - 2].balance
    : 0
  const color = trend >= 0 ? '#00C853' : '#FF3D00'

  return (
    <div className="glass-card mx-4 mb-3 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white/80">📈 กราฟเงินออม</span>
        <div className="flex gap-1">
          {[7, 30].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                range === r
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {r}วัน
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'white', fontSize: 12 }}
            formatter={(v) => [`${v.toLocaleString()} บาท`, '']}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#chartGrad)"
            dot={(props) => <CustomDot {...props} dataLength={data.length} color={color} />}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-center mt-2 text-white/70">{getMoodMessage(trend)}</p>
    </div>
  )
}
