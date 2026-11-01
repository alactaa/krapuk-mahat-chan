import { useState } from 'react'
import { api } from '../lib/api'
import GoalCard from './GoalCard'

const EMOJIS = ['🎯', '🏗️', '🚲', '🎮', '📱', '🧸', '⚽', '🎨', '✈️', '🎁']

function etaText(remain, perDay) {
  if (remain <= 0) return '🎉 ถึงเป้าแล้ว! ไปบอกพ่อแม่ได้เลย'
  if (!perDay) return ''
  const days = Math.ceil(remain / perDay)
  if (days < 60) return `⏳ ถ้าเก็บวันละ ${perDay} บาท อีก ${days} วันถึงเป้า`
  return `⏳ ถ้าเก็บวันละ ${perDay} บาท อีกประมาณ ${days.toLocaleString()} วัน (~${Math.round(days / 30)} เดือน)`
}

function GoalForm({ initial, kidId, onDone, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [target, setTarget] = useState(initial ? String(initial.target_amount) : '')
  const [emoji, setEmoji] = useState(initial?.emoji || '🎯')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const valid = name.trim() && Number(target) > 0

  async function save() {
    if (!valid || saving) return
    setSaving(true)
    setError('')
    try {
      await api.setGoal({
        kid_id: kidId,
        ...(initial ? { goal_id: initial.goal_id } : {}),
        name: name.trim(),
        target_amount: Number(target),
        emoji,
      })
      onDone()
    } catch {
      setError('บันทึกไม่สำเร็จ ลองใหม่อีกครั้งนะ')
      setSaving(false)
    }
  }

  return (
    <div className="glass-card mx-4 mb-3 p-4">
      <h3 className="text-sm font-medium text-white/80 mb-3">{initial ? '✏️ แก้เป้าหมาย' : '➕ ตั้งเป้าหมายใหม่'}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => setEmoji(e)}
            className={`text-xl w-10 h-10 rounded-xl transition-all active:scale-90 ${
              emoji === e ? 'bg-white/25 ring-2 ring-white/60' : 'bg-white/5'
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="อยากได้อะไร? เช่น จักรยาน"
        maxLength={40}
        className="w-full bg-white/10 rounded-xl px-3 py-2.5 mb-2 text-base text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30"
      />
      <input
        value={target}
        onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ''))}
        placeholder="ราคา (บาท)"
        inputMode="numeric"
        className="w-full bg-white/10 rounded-xl px-3 py-2.5 mb-3 text-base text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-white/30"
      />
      {error && <p className="text-xs text-[#FF5252] mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-white/10 text-sm text-white/70 active:scale-95 transition-transform"
        >
          ยกเลิก
        </button>
        <button
          onClick={save}
          disabled={!valid || saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: 'linear-gradient(90deg, #00C853, #00B0FF)' }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}

export default function GoalsTab({ goals, saved, dailyAmount, kidId, onSaved }) {
  // null = ไม่ได้เปิดฟอร์ม, 'new' = เพิ่มใหม่, object = แก้ goal นั้น
  const [editing, setEditing] = useState(null)

  return (
    <div className="pt-4">
      {editing && (
        <GoalForm
          key={editing === 'new' ? 'new' : editing.goal_id}
          initial={editing === 'new' ? null : editing}
          kidId={kidId}
          onCancel={() => setEditing(null)}
          onDone={() => {
            setEditing(null)
            onSaved()
          }}
        />
      )}

      {goals.length === 0 && !editing && (
        <div className="glass-card mx-4 mb-3 p-6 text-center">
          <p className="text-4xl mb-2">🎯</p>
          <p className="text-sm text-white/70">ยังไม่มีเป้าหมาย</p>
          <p className="text-xs text-white/40 mt-1">ตั้งเป้าแล้วจะรู้ว่าต้องเก็บอีกกี่วัน</p>
        </div>
      )}

      {goals.map((g) => {
        const remain = Math.max(0, Number(g.target_amount) - saved)
        return (
          <div key={g.goal_id}>
            <GoalCard goal={g} balance={saved} />
            <div className="flex items-center justify-between mx-4 -mt-1 mb-4 px-1 gap-3">
              <p className="text-xs text-white/50">{etaText(remain, dailyAmount)}</p>
              <button
                onClick={() => setEditing(g)}
                className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full shrink-0 active:scale-90 transition-transform"
              >
                ✏️ แก้
              </button>
            </div>
          </div>
        )
      })}

      {!editing && (
        <button
          onClick={() => setEditing('new')}
          className="mx-4 mb-3 w-[calc(100%-2rem)] py-3 rounded-2xl border border-dashed border-white/25 text-sm text-white/70 active:scale-95 transition-transform"
        >
          ➕ ตั้งเป้าหมายใหม่
        </button>
      )}
    </div>
  )
}
