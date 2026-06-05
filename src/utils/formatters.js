import { USD_EXCHANGE_RATE } from '../constants/shop'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const formatPrice = (price) => {
  if (typeof price === 'number') {
    return usdFormatter.format(price / USD_EXCHANGE_RATE)
  }

  return price || ''
}
