/* ================================================================
   Vbike · API Base URL Configuration
   ----------------------------------------------------------------
   Change ENV to 'production' to point the entire app at the
   live server. Every API module imports from this file, so
   one edit here updates every endpoint across the app.
   ================================================================ */

const ENV = 'local'   // 'local' | 'production'

const URLS = {
  local:      'https://backend.vbike.in',
  production: 'https://backend.vbike.in',
}

export const BASE_URL = URLS[ENV]
export const API_URL  = `${BASE_URL}/api`
