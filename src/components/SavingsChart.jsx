import { useState, useMemo } from 'react'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts'
import { signedAmount, localDateStr, txDate } from '../lib/tx'

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
    // transactions มีแค่ 30 วันล่าสุด ถ้าเอามาบวกลบเองจะขาดยอดยกมา (กราฟเคยติดศูนย์)
    // จึงใช้ balance_after ที่ชีตบันทึกไว้ทุกรายการ แล้วลากยอดล่าสุดของแต่ละวันต่อไป
    const txs = transactions
      .filter((tx) => tx.timestamp && tx.balance_after !== '' && tx.balance_after != null)
      .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))

    // ยอดก่อนรายการแรกในช่วง = ยอดหลังรายการแรก ถอยกลับด้วยจำนวนของมัน
    let running = txs.length ? Number(txs[0].balance_after) - signedAmount(txs[0]) : 0
    let next = 0
    const now = new Date()
    const points = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = localDateStr(d)
      while (next < txs.length && txDate(txs[next]) <= dateStr) {
        running = Number(txs[next].balance_after)
        next++
      }
      points.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, balance: running })
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
          {/* ยอดหลักพัน ถ้าแกนเริ่มที่ 0 เส้นจะแบนจนมองไม่เห็นการขึ้นลง */}
          <YAxis
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[
              (min) => Math.max(0, Math.floor((min * 0.9) / 100) * 100),
              (max) => Math.ceil((max * 1.05) / 100) * 100,
            ]}
          />
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
            dot={({ key, ...props }) => <CustomDot key={key} {...props} dataLength={data.length} color={color} />}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-center mt-2 text-white/70">{getMoodMessage(trend)}</p>
    </div>
  )
}
