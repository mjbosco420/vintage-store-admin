const PRODUCT_LIKES_KEY = 'productLikes'
const LIKED_PRODUCTS_KEY = 'likedProducts'
const USER_ACCOUNTS_KEY = 'userAccounts'
const CURRENT_USER_KEY = 'currentUser'
const ORDER_SUMMARIES_KEY = 'orderSummaries'

export const getSavedLikes = () => {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(PRODUCT_LIKES_KEY) || '{}')
  } catch (error) {
    console.warn('Invalid productLikes in localStorage, resetting.', error)
    return {}
  }
}

export const getLikedProducts = () => {
  if (typeof window === 'undefined') return {}

  try {
    return JSON.parse(window.localStorage.getItem(LIKED_PRODUCTS_KEY) || '{}')
  } catch (error) {
    console.warn('Invalid likedProducts in localStorage, resetting.', error)
    return {}
  }
}

export const saveProductLikes = (products) => {
  if (typeof window === 'undefined') return

  const likesMap = products.reduce((acc, item) => {
    acc[item.id] = item.likes || 0
    return acc
  }, {})

  window.localStorage.setItem(PRODUCT_LIKES_KEY, JSON.stringify(likesMap))
}

export const saveLikedProducts = (products) => {
  if (typeof window === 'undefined') return

  const likedMap = products.reduce((acc, item) => {
    acc[item.id] = Boolean(item.isLiked)
    return acc
  }, {})

  window.localStorage.setItem(LIKED_PRODUCTS_KEY, JSON.stringify(likedMap))
}

export const getUserAccounts = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.localStorage.getItem(USER_ACCOUNTS_KEY) || '[]')
  } catch (error) {
    console.warn('Invalid userAccounts in localStorage, resetting.', error)
    return []
  }
}

export const saveUserAccounts = (accounts) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts))
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null

  try {
    return JSON.parse(window.localStorage.getItem(CURRENT_USER_KEY) || 'null')
  } catch (error) {
    console.warn('Invalid currentUser in localStorage, resetting.', error)
    return null
  }
}

export const saveCurrentUser = (user) => {
  if (typeof window === 'undefined') return

  if (!user) {
    window.localStorage.removeItem(CURRENT_USER_KEY)
    return
  }

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export const getOrderSummaries = () => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(window.localStorage.getItem(ORDER_SUMMARIES_KEY) || '[]')
  } catch (error) {
    console.warn('Invalid orderSummaries in localStorage, resetting.', error)
    return []
  }
}

export const saveOrderSummaries = (summaries) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ORDER_SUMMARIES_KEY, JSON.stringify(summaries))
}
