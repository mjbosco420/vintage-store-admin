import { PRODUCT_CATEGORIES } from '../constants/shop'

export const normalizeCategory = (value) =>
  value?.toString().trim().toLowerCase().replace(/[-\s]/g, '').replace(/s$/g, '')

const primaryCategoryKeys = PRODUCT_CATEGORIES.map((category) => normalizeCategory(category))

const isPrimaryProductCategory = (category) =>
  primaryCategoryKeys.includes(normalizeCategory(category))

export const filterProductsByCategory = (products, categoryFilter) => {
  return products.filter((product) => {
    if (categoryFilter === 'All') return true
    if (categoryFilter === 'New Drop') return product.isNewDrop
    if (categoryFilter === 'Others') return !isPrimaryProductCategory(product.category)
    return normalizeCategory(product.category) === normalizeCategory(categoryFilter)
  })
}
