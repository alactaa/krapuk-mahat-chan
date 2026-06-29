import { useState, useEffect } from 'react'

const MODAL_META = {
  deposit:    { title: '💰 ฝากเงิน',   color: '#00C853', label: 'จำนวนที่ฝาก' },
  withdraw:   { title: '🛒 ใช้เงิน',   color: '#FF3D00', label: 'จำนวนที่ใช้' },
  loan:       { title: '🤝 ยืมเงิน',   color: '#9C27B0', label: 'จำนวนที่ยืม' },
  bonus:      { title: '⭐ โบนัส',     color: '#FFD600', label: 'จำนวนโบนัส' },
  loan_repay: { title: '💜 จ่ายคืน',   color: '#9C27B0', label: 'จำนวนที่จ่าย' },
}

const QUICK_AMOUNTS = [20, 50, 100, 200]

export default function ActionModal({ type, onClose, onConfirm, balance, loanRemaining }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const meta = MODAL_META[type] || {}

  useEffect(() => {
    setAmount('')
    setNote('')
    setError('')
  }, [type])

  function validate(val) {
    const n = Number(val)
    if (!val || n <= 0) return 'กรุณากรอกจำนวนเงิน'
    if (type === 'withdraw' && n > balance) return `เงินไม่พอ (มี ${balance.toLocaleString()} ฿)`
    if (type === 'loan' && (loanRemaining + n) > 200)
      return `ยืมได้อีกแค่ ${(200 - loanRemaining).toLocaleString()} ฿ (วงเงิน 200 ฿)`
    if (type === 'loan_repay') {
      if (n > balance) return `เงินไม่พอ (มี ${balance.toLocaleString()} ฿)`
      if (n > loanRemaining) return `ยืมอยู่แค่ ${loanRemaining.toLocaleString()} ฿`
    }
    return ''
  }

  async function handleConfirm() {
    const err = validate(amount)
    if (err) { setError(err); return }
    setLoading(true)
    try {
      await onConfirm({ type, amount: Number(amount), note })
      onClose()
    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full animate-slide-up">
        <div
          className="mx-2 mb-2 rounded-3xl p-5"
          style={{ background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          {/* handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

          <h2 className="text-lg font-semibold text-center mb-4">{meta.title}</h2>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={`py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                  amount === String(q)
                    ? 'text-black'
                    : 'bg-white/10 text-white/70'
                }`}
                style={amount === String(q) ? { background: meta.color } : {}}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div className="mb-3">
            <label className="text-xs text-white/50 mb-1 block">{meta.label} (บาท)</label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
              placeholder="0"
              className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:text-white/20 outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {/* Note input */}
          <div className="mb-4">
            <label className="text-xs text-white/50 mb-1 block">หมายเหตุ (ไม่บังคับ)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น ซื้อขนม, วันเกิด..."
              className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center mb-3">⚠️ {error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-base transition-all active:scale-98 disabled:opacity-50"
            style={{ background: meta.color, color: type === 'bonus' ? '#000' : '#fff' }}
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  )
}
