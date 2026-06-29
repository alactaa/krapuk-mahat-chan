async function call(params) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`/api/proxy?${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  getAll:          (kid_id, days = 30) => call({ action: 'getAll', kid_id, days }),
  getKid:          (kid_id)            => call({ action: 'getKid', kid_id }),
  addTransaction:  (data)              => call({ action: 'addTransaction', ...data }),
  checkDaily:      (kid_id)            => call({ action: 'checkDaily', kid_id }),
  setGoal:         (data)              => call({ action: 'setGoal', ...data }),
}
