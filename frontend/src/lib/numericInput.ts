export type NormalizeNumericOptions = {
  allowDecimal?: boolean
  allowNegative?: boolean
}

/** Returns normalized text, or null if input is invalid. */
export function normalizeNumericInput(
  raw: string,
  { allowDecimal = false, allowNegative = false }: NormalizeNumericOptions = {},
): string | null {
  if (raw === '') return ''
  if (allowNegative && raw === '-') return '-'

  if (allowDecimal) {
    const pattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/
    if (!pattern.test(raw)) return null

    let sign = ''
    let body = raw
    if (allowNegative && body.startsWith('-')) {
      sign = '-'
      body = body.slice(1)
    }

    if (body === '.') return `${sign}0.`
    if (body.endsWith('.')) {
      const intPart = body.slice(0, -1)
      if (intPart === '') return `${sign}0.`
      const normalizedInt = intPart.replace(/^0+/, '') || '0'
      return `${sign}${normalizedInt}.`
    }

    const dotIndex = body.indexOf('.')
    if (dotIndex === -1) {
      if (body === '') return sign
      const normalizedInt = body.replace(/^0+/, '') || '0'
      return `${sign}${normalizedInt}`
    }

    const intPart = body.slice(0, dotIndex)
    const decPart = body.slice(dotIndex + 1)
    const normalizedInt = intPart === '' ? '0' : (intPart.replace(/^0+/, '') || '0')
    return `${sign}${normalizedInt}.${decPart}`
  }

  const pattern = allowNegative ? /^-?\d+$/ : /^\d+$/
  if (!pattern.test(raw)) return null

  const negative = allowNegative && raw.startsWith('-')
  const digits = negative ? raw.slice(1) : raw
  const normalized = digits.replace(/^0+/, '') || '0'
  if (negative) {
    return normalized === '0' ? '0' : `-${normalized}`
  }
  return normalized
}

export function parseNumericText(
  text: string,
  { allowDecimal = false }: NormalizeNumericOptions = {},
): number {
  if (text === '' || text === '-' || text === '.' || text === '-.' || text.endsWith('.')) {
    return 0
  }
  const parsed = allowDecimal ? parseFloat(text) : parseInt(text, 10)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function formatNumericDisplay(
  value: number | string,
  emptyWhenZero = true,
): string {
  if (typeof value === 'string') {
    if (value === '') return ''
    if (emptyWhenZero && (value === '0' || value === '-0')) return ''
    return value
  }
  if (emptyWhenZero && value === 0) return ''
  return String(value)
}
