async function call(params) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/proxy?${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  // Apps Script ตอบ 200 เสมอ ข้อผิดพลาดมาเป็น { error } — ไม่โยนต่อจะขึ้น toast ว่าสำเร็จทั้งที่ไม่ได้บันทึก
  if (data?.error) throw new Error(data.error)
  return data
}

export const api = {
  getAll:          (kid_id, days = 30) => call({ action: 'getAll', kid_id, days }),
  getKid:          (kid_id)            => call({ action: 'getKid', kid_id }),
  addTransaction:  (data)              => call({ action: 'addTransaction', ...data }),
  checkDaily:      (kid_id)            => call({ action: 'checkDaily', kid_id }),
  setGoal:         (data)              => call({ action: 'setGoal', ...data }),
}
