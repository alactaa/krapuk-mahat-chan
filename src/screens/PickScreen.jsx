import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const KIDS_CONFIG = [
  {
    id: 'tae',
    name: 'Tae',
    avatar: 'tae.jpg',
    gradient: 'linear-gradient(160deg, #FF6B9D, #FF9A3C)',
    emoji: '🎮',
  },
  {
    id: 'taey',
    name: 'Taey',
    avatar: 'taey.jpg',
    gradient: 'linear-gradient(160deg, #4FC3F7, #7C4DFF)',
    emoji: '🦉',
  },
]

function Star({ style }) {
  return (
    <div
      className="absolute rounded-full bg-white animate-twinkle"
      style={{ width: 3, height: 3, ...style }}
    />
  )
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  '--duration': `${1.5 + Math.random() * 3}s`,
  animationDelay: `${Math.random() * 3}s`,
}))

export default function PickScreen({ onPick }) {
  const [balances, setBalances] = useState({})

  useEffect(() => {
    KIDS_CONFIG.forEach(async (k) => {
      try {
        const data = await api.getKid(k.id)
        setBalances((prev) => ({ ...prev, [k.id]: data.balance }))
      } catch {
        setBalances((prev) => ({ ...prev, [k.id]: null }))
      }
    })
  }, [])

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center px-4 overflow-hidden" style={{ background: '#1A1A2E' }}>
      {/* Stars */}
      {STARS.map((s, i) => <Star key={i} style={s} />)}

      <div className="relative z-10 text-center mb-10">
        <h1 className="text-3xl font-bold mb-1">✨ กระปุกมหัศจรรย์ ✨</h1>
        <p className="text-white/60 text-sm">ใครจะเปิดกระปุกวันนี้?</p>
      </div>

      <div className="relative z-10 flex gap-4 w-full max-w-sm">
        {KIDS_CONFIG.map((kid) => (
          <button
            key={kid.id}
            onClick={() => onPick(kid)}
            className="flex-1 rounded-3xl p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform border border-white/10"
            style={{ background: kid.gradient }}
          >
            <img
              src={`/assets/${kid.avatar}`}
              alt={kid.name}
              className="w-24 h-24 object-cover object-top rounded-2xl shadow-xl"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <div className="text-center">
              <p className="font-bold text-white text-lg drop-shadow">{kid.name} {kid.emoji}</p>
              <p className="text-white/90 font-medium text-sm">
                {balances[kid.id] != null
                  ? `${Number(balances[kid.id]).toLocaleString()} ฿`
                  : '...'}
              </p>
              <p className="text-white/70 text-xs mt-1">👆 แตะเลย!</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
