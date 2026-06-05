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

  const signUp = ({ name, email, password }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const accounts = getUserAccounts()
      const existingAccount = accounts.find((account) => account.email === normalizedEmail)

      if (existingAccount) {
        setAuthError('Email already registered. Please log in.')
        return null
      }

      const account = {
        id: createUserId(),
        name: name.trim(),
        email: normalizedEmail,
        password,
      }
      const user = createPublicUser(account)

      saveUserAccounts([...accounts, account])
      saveCurrentUser(user)
      setCurrentUser(user)
      setAuthError('')
      return user
    } catch (error) {
      console.error('Failed to create account:', error)
      setAuthError('Unable to create account on this browser. Please try again.')
      return null
    }
  }

  const login = ({ email, password }) => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const accounts = getUserAccounts()
      const account = accounts.find(
        (item) => item.email === normalizedEmail && item.password === password,
      )

      if (!account) {
        setAuthError('Email or password is incorrect.')
        return null
      }

      const user = createPublicUser(account)

      saveCurrentUser(user)
      setCurrentUser(user)
      setAuthError('')
      return user
    } catch (error) {
      console.error('Failed to log in:', error)
      setAuthError('Unable to log in on this browser. Please try again.')
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
