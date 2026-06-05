import { useState } from 'react'

export default function AuthModal({
  error,
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  onSuccess,
}) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [validationError, setValidationError] = useState('')

  if (!isOpen) return null

  const isSignUp = mode === 'signup'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')

    if (isSignUp) {
      // Enforce secure passwords: at least 6 chars, contains letters and numbers
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{6,}$/
      if (!passwordRegex.test(form.password)) {
        setValidationError('Password must be at least 6 characters and include letters and numbers.')
        return
      }
      
      // Sanitize name input to prevent basic XSS or weird characters
      const sanitizedName = form.name.replace(/[<>]/g, '').trim()
      if (sanitizedName.length < 2) {
        setValidationError('Please provide a valid name.')
        return
      }
      form.name = sanitizedName
    }

    const user = await (isSignUp ? onSignUp(form) : onLogin(form))

    if (user) {
      // Trigger the welcome email in the background if it's a new sign-up
      if (isSignUp && form.email) {
        try {
          const response = await fetch('/api/send-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: form.name, email: form.email }),
          })
          
          if (!response.ok) {
            let errorMessage = 'Gagal mengirim email.'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorMessage
            } catch (e) {
              errorMessage = `Server Error ${response.status}`
            }
            setValidationError(errorMessage)
            return // Hentikan proses, jangan tutup modal agar error terbaca
          }
        } catch (err) {
          console.error('Failed to trigger welcome email:', err)
          setValidationError('Koneksi terputus saat mencoba mengirim email.')
          return // Hentikan proses
        }
      }

      setForm({ name: '', email: '', password: '' })
      onSuccess(user)
    }
  }

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/80 px-4 backdrop-blur-md">
      <button
        type="button"
        aria-label="Close account modal"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />

      <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#090909] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/40">Account</p>
            <h2 className="mt-2 text-3xl font-black">{isSignUp ? 'Sign Up' : 'Login'}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
          >
            x
          </button>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!isSignUp ? 'bg-white text-black' : 'text-white/60'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isSignUp ? 'bg-white text-black' : 'text-white/60'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="auth-name" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={form.email}
              onChange={(event) => handleChange('email', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
            />
          </div>
        </div>

      {(error || validationError) && (
          <p className="mt-4 rounded-2xl border border-[#ff2153]/25 bg-[#ff2153]/10 px-4 py-3 text-sm text-[#ff8ca2]">
          {error || validationError}
          </p>
        )}

        <button type="submit" className="mt-6 w-full rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02]">
          {isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}
        </button>
      </form>
    </div>
  )
}
