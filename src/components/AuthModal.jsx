import { useState } from 'react'

export default function AuthModal({
  error,
  isOpen,
  onClose,
  onLogin,
  onResetPassword,
  onSignUp,
  onSuccess,
}) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')

  if (!isOpen) return null

  const isSignUp = mode === 'signup'
  const isResetMode = mode === 'reset'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setValidationError('')

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{6,}$/
    if (!passwordRegex.test(form.password)) {
      setValidationError('Password must be at least 6 characters and include letters and numbers.')
      return
    }

    let payload = { ...form }
    if (isSignUp) {
      const sanitizedName = form.name.replace(/[<>]/g, '').trim()
      if (sanitizedName.length < 2) {
        setValidationError('Please provide a valid name.')
        return
      }
      payload = { ...payload, name: sanitizedName }
    }

    const user = await (isResetMode ? onResetPassword(payload) : isSignUp ? onSignUp(payload) : onLogin(payload))

    if (user) {
      if (isSignUp && form.email) {
        try {
          const response = await fetch('/api/send-welcome', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: payload.name, email: payload.email }),
          })

          if (!response.ok) {
            let errorMessage = 'Failed to send welcome email.'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorMessage
            } catch {
              errorMessage = `Server Error ${response.status}`
            }
            setValidationError(errorMessage)
            return
          }
        } catch (err) {
          console.error('Failed to trigger welcome email:', err)
          setValidationError('Unable to send welcome email. Please try again later.')
          return
        }
      }

      setForm({ name: '', email: '', password: '' })
      onSuccess(user, mode)
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
            <h2 className="mt-2 text-3xl font-black">
              {isResetMode ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Login'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
          >
            x
          </button>
        </div>

        <div className="mb-5 grid grid-cols-[1fr_1fr_1fr] rounded-full border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setValidationError('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!isSignUp && !isResetMode ? 'bg-white text-black' : 'text-white/60'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setValidationError('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isSignUp ? 'bg-white text-black' : 'text-white/60'}`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset')
              setValidationError('')
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isResetMode ? 'bg-white text-black' : 'text-white/60'}`}
          >
            Reset
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

          {isResetMode && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white/70">
              Enter your registered email and choose a new password to recover access.
              If you do not have an account yet, switch to Sign Up.
            </div>
          )}

          <div className="relative">
            <label htmlFor="auth-password" className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/40">
              Password
            </label>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              value={form.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            <p className="mt-2 text-xs text-white/50">Show password while typing so you can confirm it exactly.</p>
          </div>
        </div>

        {!isSignUp && !isResetMode && (
          <div className="mt-2 text-right text-sm text-white/60">
            <button
              type="button"
              onClick={() => {
                setMode('reset')
                setValidationError('')
              }}
              className="font-semibold text-white underline"
            >
              Forgot password?
            </button>
          </div>
        )}

      {(error || validationError) && (
        <div className="mt-4 rounded-2xl border border-[#ff2153]/25 bg-[#ff2153]/10 px-4 py-3 text-sm text-[#ff8ca2]">
          <p>{error || validationError}</p>
          {isResetMode && error === 'No account found with that email address.' && (
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setValidationError('')
              }}
              className="mt-3 text-sm font-semibold text-white underline"
            >
              Create a new account instead.
            </button>
          )}
        </div>
      )}

      {isResetMode && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/70">
          Your password will be updated immediately and you will be logged in automatically.
        </div>
      )}

      <button type="submit" className="mt-6 w-full rounded-full bg-white px-6 py-4 text-sm font-bold text-black transition hover:scale-[1.02]">
        {isResetMode ? 'RESET PASSWORD' : isSignUp ? 'CREATE ACCOUNT' : 'LOGIN'}
      </button>

      {isResetMode && (
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setValidationError('')
          }}
          className="mt-3 w-full rounded-full border border-white/10 bg-transparent px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Back to Login
        </button>
      )}
    </form>
    </div>
  )
}
