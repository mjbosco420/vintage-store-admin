const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN,
  'https://vintagestuff.vercel.app',
  'http://localhost:3000',
  'http://localhost:3333',
].filter(Boolean)

export function checkCsrf(req, res) {
  const origin = req.headers['origin'] || req.headers['referer'] || ''
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed))

  if (!isAllowed) {
    res.status(403).json({ message: 'Forbidden: Invalid origin.' })
    return false
  }

  return true
}
