// Simple in-memory rate limiter
// Resets on server restart/redeploy

const requestCounts = new Map()

/**
 * @param {string} ip - IP address of the requester
 * @param {string} route - Route identifier (e.g. 'place-order')
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
export function rateLimit(ip, route, limit = 10, windowMs = 60_000) {
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = requestCounts.get(key)

  if (!entry || now - entry.startTime > windowMs) {
    requestCounts.set(key, { count: 1, startTime: now })
    return { limited: false }
  }

  entry.count += 1

  if (entry.count > limit) {
    return { limited: true }
  }

  return { limited: false }
}
