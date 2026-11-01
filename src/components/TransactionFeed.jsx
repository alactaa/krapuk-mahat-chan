import { TYPE_META } from '../lib/tx'

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getDate()}/${d.getMonth() + 1} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function TransactionFeed({ transactions }) {
  const recent = (transactions || []).slice(0, 20)

  return (
    <div className="glass-card mx-4 mb-24 p-4">
      <h3 className="text-sm font-medium text-white/70 mb-3">📋 รายการล่าสุด</h3>
      {recent.length === 0 && (
        <p className="text-center text-white/30 text-sm py-4">ยังไม่มีรายการ</p>
      )}
      <div className="space-y-2">
        {recent.map((tx) => {
          const meta = TYPE_META[tx.type] || { icon: '💫', label: tx.type, color: '#fff', sign: '+' }
          return (
            <div key={tx.tx_id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{meta.icon}</span>
                <div>
                  <p className="text-sm font-medium">
                    {tx.note || meta.label}
                    {tx.account && <span className="text-xs text-[#40C4FF] ml-1.5">· {tx.account}</span>}
                  </p>
                  <p className="text-xs text-white/40">{formatDate(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: meta.color }}>
                  {meta.sign}{Number(tx.amount).toLocaleString()} ฿
                </p>
                <p className="text-xs text-white/40">{Number(tx.balance_after).toLocaleString()} ฿</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
