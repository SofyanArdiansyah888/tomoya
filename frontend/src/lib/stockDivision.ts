export type StockDivision = 'pastry' | 'minuman'

export const PASTRY_CATEGORY_NAMES = ['pastry', 'cake', 'dessert'] as const

export const STOCK_DIVISION_LABELS: Record<StockDivision, string> = {
  pastry: 'Pastry',
  minuman: 'Minuman',
}

export function isPastryCategoryName(name?: string | null): boolean {
  if (!name) return false
  return (PASTRY_CATEGORY_NAMES as readonly string[]).includes(name.trim().toLowerCase())
}

export function isMinumanCategoryName(name?: string | null): boolean {
  if (!name) return false
  return name.trim().toLowerCase() === 'minuman' 
}

export function isPastryProductCategory(name?: string | null): boolean {
  return isPastryCategoryName(name)
}

export function getStockDivisionLabel(division: StockDivision): string {
  return STOCK_DIVISION_LABELS[division]
}
