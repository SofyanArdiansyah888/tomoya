/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The number to format
 * @param showSymbol - Whether to show the Rp symbol (default: true)
 * @returns Formatted currency string
 */
export const formatPrice = (amount: number | string, showSymbol: boolean = true): string => {
  if (!amount || amount === '' || amount === 0) return showSymbol ? 'Rp 0' : '0'
  
  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numericValue)) return showSymbol ? 'Rp 0' : '0'
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue)
  
  return showSymbol ? `Rp ${formatted}` : formatted
}

/**
 * Format number to Indonesian Rupiah currency with decimal places
 * @param amount - The number to format
 * @param showSymbol - Whether to show the Rp symbol (default: true)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with decimals
 */
export const formatPriceWithDecimals = (amount: number | string, showSymbol: boolean = true, decimals: number = 2): string => {
  if (!amount || amount === '' || amount === 0) return showSymbol ? 'Rp 0' : '0'
  
  const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numericValue)) return showSymbol ? 'Rp 0' : '0'
  
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numericValue)
  
  return showSymbol ? `Rp ${formatted}` : formatted
}
