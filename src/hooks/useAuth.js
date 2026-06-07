import { useState } from 'react'
import {
  getCurrentUser,
  getUserAccounts,
  saveCurrentUser,
  saveUserAccounts,
} from '../utils/storage'

const createPublicUser = (account) => ({
  id: account.id,
  name: account.name,
  email: account.email,
})

const createUserId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `user-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser())
  const [authError, setAuthError] = useState('')

  const signUp = async ({ name, email, password }) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(data.message || 'Unable to create account.')
        return null
      }

      const user = {
        id: data.customerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      }

      saveCurrentUser(user)
      setCurrentUser(user)
      setAuthError('')

      return user
    } catch (error) {
      console.error('Failed to create account:', error)
      setAuthError('Unable to create account. Please try again.')
      return null
    }
  }

  const login = async ({ email, password }) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(data.message || 'Email or password is incorrect.')
        return null
      }

      saveCurrentUser(data.user)
      setCurrentUser(data.user)
      setAuthError('')

      return data.user
    } catch (error) {
      console.error('Failed to log in:', error)
      setAuthError('Unable to log in. Please try again.')
      return null
    }
  }

  const resetPassword = ({ email, password }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const accounts = getUserAccounts()
      const accountIndex = accounts.findIndex((item) => item.email === normalizedEmail)

      if (accountIndex === -1) {
        setAuthError('No account found with that email address.')
        return null
      }

      const updatedAccounts = [...accounts]
      updatedAccounts[accountIndex] = {
        ...updatedAccounts[accountIndex],
        password,
      }

      const user = createPublicUser(updatedAccounts[accountIndex])
      saveUserAccounts(updatedAccounts)
      saveCurrentUser(user)
      setCurrentUser(user)
      setAuthError('')
      return user
    } catch (error) {
      console.error('Failed to reset password:', error)
      setAuthError('Unable to reset password on this browser. Please try again.')
      return null
    }
  }

  const logout = () => {
    saveCurrentUser(null)
    setCurrentUser(null)
    setAuthError('')
  }

  return {
    currentUser,
    authError,
    clearAuthError: () => setAuthError(''),
    login,
    logout,
    resetPassword,
    signUp,
  }
}
