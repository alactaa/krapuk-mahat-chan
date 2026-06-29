import { useState } from 'react'
import { useKidData } from '../hooks/useKidData'
import { useDaily } from '../hooks/useDaily'
import { api } from '../lib/api'
import BalanceHero from '../components/BalanceHero'
import StreakBar from '../components/StreakBar'
import SavingsChart from '../components/SavingsChart'
import GoalCard from '../components/GoalCard'
import LoanWarning from '../components/LoanWarning'
import ActionGrid from '../components/ActionGrid'
import TransactionFeed from '../components/TransactionFeed'
import ActionModal from '../components/ActionModal'

function Toast({ msg }) {
  if (!msg) return null
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-slide-up">
      {msg}
    </div>
  )
}

const NAV_ITEMS = [
  { icon: '🏠', label: 'หน้าหลัก', key: 'home' },
  { icon: '📊', label: 'สถิติ', key: 'stats' },
  { icon: '🎯', label: 'เป้าหมาย', key: 'goals' },
  { icon: '🏆', label: 'รางวัล', key: 'rewards' },
]

export default function MainScreen({ kid: kidConfig, onBack }) {
  const { kid, transactions, goals, loading, refresh } = useKidData(kidConfig.id)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState('')
  const [activeNav, setActiveNav] = useState('home')

  const gradient = kidConfig.gradient

  useDaily(kidConfig.id, (amount) => {
    showToast(`🎉 ได้รับเงินรายวัน +${amount} บาท!`)
    refresh()
  })

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleAction(data) {
    await api.addTransaction({ kid_id: kidConfig.id, ...data })
    showToast(
      data.type === 'deposit' ? `💰 ฝาก +${data.amount} บาท` :
      data.type === 'withdraw' ? `🛒 ใช้ -${data.amount} บาท` :
      data.type === 'loan' ? `🤝 ยืม +${data.amount} บาท` :
      data.type === 'bonus' ? `⭐ โบนัส +${data.amount} บาท` :
      data.type === 'loan_repay' ? `💜 จ่ายคืน -${data.amount} บาท` : 'บันทึกแล้ว!'
    )
    refresh()
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayDelta = (transactions || [])
    .filter((tx) => tx.timestamp?.slice(0, 10) === todayStr)
    .reduce((s, tx) => {
      const sign = ['deposit', 'daily', 'bonus', 'loan'].includes(tx.type) ? 1 : -1
      return s + sign * Number(tx.amount)
    }, 0)

  const activeLoans = (kid?.loans || []).filter((l) => l.status === 'active')
  const loanRemaining = activeLoans.reduce((s, l) => s + Number(l.remaining), 0)

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#1A1A2E' }}>
      <Toast msg={toast} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-12 pb-4"
        style={{ background: gradient }}
      >
        <button onClick={onBack} className="text-white/80 text-lg p-1 active:scale-90 transition-transform">←</button>
        <span className="font-semibold text-white">
          {kidConfig.name} {kidConfig.emoji}
        </span>
        <button className="text-white/80 text-lg p-1">🔔</button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-60 text-white/40 text-sm">กำลังโหลด...</div>
        ) : (
          <>
            {kid && (
              <BalanceHero
                kid={{ id: kidConfig.id, name: kidConfig.name, avatar: kidConfig.avatar, balance: kid.balance }}
                todayDelta={todayDelta}
              />
            )}
            <StreakBar streak={kid?.streak || 0} />
            <SavingsChart transactions={transactions || []} />
            <ActionGrid onAction={(type) => setModal(type)} />
            {goals?.length > 0 && (
              <GoalCard goal={goals[0]} balance={kid?.balance || 0} />
            )}
            {activeLoans.length > 0 && (
              <LoanWarning loans={activeLoans} onRepay={() => setModal('loan_repay')} />
            )}
            <TransactionFeed transactions={transactions} />
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div
        className="fixed bottom-0 left-0 right-0 flex border-t border-white/10"
        style={{ background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV_ITEMS.map((n) => (
          <button
            key={n.key}
            onClick={() => setActiveNav(n.key)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all active:scale-90 ${
              activeNav === n.key ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <span className="text-xl">{n.icon}</span>
            <span className="text-xs">{n.label}</span>
          </button>
        ))}
      </div>

      {/* Action Modal */}
      {modal && (
        <ActionModal
          type={modal}
          balance={kid?.balance || 0}
          loanRemaining={loanRemaining}
          onClose={() => setModal(null)}
          onConfirm={handleAction}
        />
      )}
    </div>
  )
}
