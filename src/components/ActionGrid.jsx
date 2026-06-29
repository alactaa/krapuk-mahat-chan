const actions = [
  { key: 'deposit', icon: '💰', label: 'ฝาก', color: '#00C853' },
  { key: 'withdraw', icon: '🛒', label: 'ใช้', color: '#FF3D00' },
  { key: 'loan', icon: '🤝', label: 'ยืม', color: '#9C27B0' },
  { key: 'bonus', icon: '⭐', label: 'โบนัส', color: '#FFD600' },
]

export default function ActionGrid({ onAction }) {
  return (
    <div className="grid grid-cols-4 gap-3 mx-4 mb-3">
      {actions.map((a) => (
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
