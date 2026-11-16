export const CITIES = ['All India', 'Chennai', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Kolkata']
export const MAX_LEN = 280
export const SITE_NAME = 'Kalesh'
export const TAGLINE = "India's Live Drama & Ratio Feed"

// Public base URL used in share links and the card watermark.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/+$/, '')
export const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host
  } catch {
    return window.location.host
  }
})()
