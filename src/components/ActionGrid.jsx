const actions = [
  { key: 'deposit', icon: '💰', label: 'ฝาก', color: '#00C853' },
  { key: 'withdraw', icon: '🛒', label: 'ใช้', color: '#FF3D00' },
  { key: 'loan', icon: '🤝', label: 'ยืม', color: '#9C27B0' },
  { key: 'bonus', icon: '⭐', label: 'โบนัส', color: '#FFD600' },
  { key: 'bank', icon: '🏦', label: 'ฝากธนาคาร', color: '#00B0FF' },
]

// showBank: ซ่อนปุ่มธนาคารจนกว่า Apps Script จะรองรับ (ส่ง bank_total มา) — ตัวเก่าไม่เก็บชื่อธนาคาร
export default function ActionGrid({ onAction, showBank }) {
  const shown = showBank ? actions : actions.filter((a) => a.key !== 'bank')
  return (
    <div className={`grid ${showBank ? 'grid-cols-5 gap-2' : 'grid-cols-4 gap-3'} mx-4 mb-3`}>
      {shown.map((a) => (
        <button
          key={a.key}
          onClick={() => onAction(a.key)}
          className="glass-card flex flex-col items-center justify-center py-3 gap-1 active:scale-95 transition-transform"
        >
          <span className="text-2xl">{a.icon}</span>
          <span className="text-xs font-medium" style={{ color: a.color }}>{a.label}</span>
        </button>
      ))}
    </div>
  )
}
