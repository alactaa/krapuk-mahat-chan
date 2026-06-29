export default function StreakBar({ streak }) {
  return (
    <div className="glass-card mx-4 mb-3 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl animate-shake">🔥</span>
        <span className="text-sm font-medium text-white/80">ออมติดต่อกัน</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/60 text-sm">{streak} วัน</span>
        <div className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {streak}
        </div>
      </div>
    </div>
  )
}
