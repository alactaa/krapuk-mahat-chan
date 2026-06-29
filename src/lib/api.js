const SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || ''

async function get(params) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${SCRIPT_URL}?${qs}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function post(action, body) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...body }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const api = {
  getKid: (kid_id) => get({ action: 'getKid', kid_id }),
  getTransactions: (kid_id, days = 30) => get({ action: 'getTransactions', kid_id, days }),
  getGoals: (kid_id) => get({ action: 'getGoals', kid_id }),
  addTransaction: (data) => post('addTransaction', data),
  checkDaily: (kid_id) => post('checkDaily', { kid_id }),
  setGoal: (data) => post('setGoal', data),
}
