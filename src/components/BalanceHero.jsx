export default function BalanceHero({ kid, todayDelta }) {
  const gradient = kid.id === 'tae'
    ? 'linear-gradient(160deg, #FF6B9D, #FF9A3C)'
    : 'linear-gradient(160deg, #4FC3F7, #7C4DFF)'

  return (
    <div className="flex flex-col items-center pt-6 pb-4 px-4">
      <div className="animate-float mb-4">
        <img
          src={`/assets/${kid.avatar}`}
          alt={kid.name}
          className="w-28 h-28 object-cover object-top rounded-3xl shadow-2xl"
          style={{ border: '3px solid rgba(255,255,255,0.25)' }}
        />
      </div>
      <p className="text-sm text-white/60 mb-1">ยอดเงินในกระปุก</p>
      <div
        className="text-5xl font-bold bg-clip-text text-transparent mb-2"
        style={{ backgroundImage: gradient, WebkitBackgroundClip: 'text' }}
      >
        {kid.balance.toLocaleString()} บาท
      </div>
      {todayDelta !== 0 && (
        <div className={`text-sm font-medium flex items-center gap-1 ${todayDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {todayDelta > 0 ? '📈' : '📉'}
          {todayDelta > 0 ? '+' : ''}{todayDelta.toLocaleString()} บาท วันนี้
        </div>
      )}
      {/* bank_total มาจาก getKid (Apps Script ตัวใหม่) — ตัวเก่าไม่มี field นี้ก็แค่ไม่แสดง */}
      {kid.bankTotal > 0 && (
        <div className="glass-card w-full mt-4 px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">🐷 ในกระปุก</span>
            <span className="font-medium">{kid.balance.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-white/60">🏦 ในบัญชีธนาคาร</span>
            <span className="font-medium text-[#40C4FF]">{kid.bankTotal.toLocaleString()} ฿</span>
          </div>
          <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
            <span className="text-sm text-white/80">💰 เงินออมทั้งหมด</span>
            <span className="text-base font-bold text-[#69F0AE]">{(kid.balance + kid.bankTotal).toLocaleString()} ฿</span>
          </div>
        </div>
      )}
    </div>
  )
}
