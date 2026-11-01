// ชนิดที่ทำให้ยอดเพิ่ม — ต้องตรงกับ getKid/addTransaction ใน Code.gs
export const BALANCE_PLUS = ['deposit', 'daily', 'bonus', 'loan']

export const TYPE_META = {
  daily:      { icon: '🌅', label: 'เงินรายวัน',  color: '#00C853', sign: '+' },
  deposit:    { icon: '💰', label: 'ฝากเงิน',     color: '#00C853', sign: '+' },
  withdraw:   { icon: '🛒', label: 'ใช้เงิน',     color: '#FF3D00', sign: '-' },
  loan:       { icon: '🤝', label: 'ยืมเงิน',     color: '#9C27B0', sign: '+' },
  bonus:      { icon: '⭐', label: 'โบนัส',       color: '#FFD600', sign: '+' },
  loan_repay: { icon: '💜', label: 'จ่ายคืน',     color: '#9C27B0', sign: '-' },
}

export function signedAmount(tx) {
  return (BALANCE_PLUS.includes(tx.type) ? 1 : -1) * Number(tx.amount)
}

// วันที่ตามเวลาเครื่อง (ไทย) — toISOString เป็น UTC จะเพี้ยนไป 1 วันช่วงตี 0-7
export function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// timestamp จากชีตเป็น 'yyyy-MM-ddTHH:mm:ss+07:00' — 10 ตัวแรกคือวันที่ไทยอยู่แล้ว
export function txDate(tx) {
  return String(tx.timestamp || '').slice(0, 10)
}
