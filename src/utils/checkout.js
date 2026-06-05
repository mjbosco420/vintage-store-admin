import { WHATSAPP_NUMBER } from '../constants/shop'

const getFallbackValue = (value) => value.trim() || '-'

export const createWhatsAppCheckoutUrl = (cartItems, buyerDetails = {}) => {
  const productLines = cartItems
    .map((item, index) => `${index + 1}. ${item.name}\n   Price: ${item.price}\n   Quantity: ${item.quantity}`)
    .join('\n')

  const message = [
    'Hello MJBOSCO, I would like to place an order.',
    '',
    'Buyer Name:',
    getFallbackValue(buyerDetails.name || ''),
    '',
    'Order Details:',
    productLines,
    '',
    'Shipping Address:',
    getFallbackValue(buyerDetails.address || ''),
    '',
    'Additional Notes:',
    getFallbackValue(buyerDetails.notes || ''),
    '',
    'Please confirm availability and total payment details. Thank you.',
  ].join('\n')

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
