export default async function handler(req, res) {
  const SCRIPT_URL = process.env.APPS_SCRIPT_URL
  const qs = new URLSearchParams(req.query).toString()
  try {
    const response = await fetch(`${SCRIPT_URL}?${qs}`)
    const data = await response.json()
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
