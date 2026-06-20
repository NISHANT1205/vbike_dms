import { API_URL } from '../config/api'
import { getAuthHeaders } from './auth'

const CACHE_KEY = 'vbike_po_products'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function fetchProducts() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw) {
      const { ts, data } = JSON.parse(raw)
      if (Date.now() - ts < CACHE_TTL) return data
    }
  } catch {}

  const res = await fetch(`${API_URL}/purchase-orders/products`, {
    headers: { ...getAuthHeaders() },
  })
  const json = await res.json()

  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Failed to fetch products.')
  }

  const products = (json.data || []).map((p) => ({
    _id:                 p._id,
    name:                p.name,
    price:               p.price ?? null,
    product_type:        p.productType || '',
    stock_quantity:      p.stock_quantity ?? null,
    super_stockist_price: p.super_stockist_price || 0,
    exclusive_price:      p.exclusive_price || 0,
    sub_dealer_price:     p.sub_dealer_price || 0,
  }))

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: products }))
  } catch {}

  return products
}

export function clearProductsCache() {
  localStorage.removeItem(CACHE_KEY)
}
