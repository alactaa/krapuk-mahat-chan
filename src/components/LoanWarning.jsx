export default function LoanWarning({ loans, onRepay }) {
  if (!loans || loans.length === 0) return null

  const totalRemaining = loans.reduce((s, l) => s + Number(l.remaining), 0)

  return (
    <div className="mx-4 mb-3 px-4 py-3 rounded-2xl border border-purple-500/40 bg-purple-500/10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">💜</span>
        <span className="text-sm text-purple-200">ยืมอยู่ {totalRemaining.toLocaleString()} ฿</span>
      </div>
      <button
        onClick={onRepay}
        className="text-xs bg-purple-500 text-white px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform"
      >
        จ่ายคืน
      </button>
    </div>
  )
}
