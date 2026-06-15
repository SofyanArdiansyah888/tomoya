import { CartItemType, escapeHtml, printSingleReceipt } from './printShared'

/**
 * Format checker order number: DD-MM-YY-HHMM
 * Example: 11-11-25-1318 (11 Nov 2025, 13:18)
 */
const formatCheckerOrderNumber = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}-${month}-${year}-${hours}${minutes}`
}

/**
 * Build checker receipt HTML content with different layout
 */
const buildCheckerReceiptContent = (
  cart: CartItemType[],
  formattedDate: string,
  orderDate: Date,
  clientName?: string
): string => {
  const checkerOrderNumber = formatCheckerOrderNumber(orderDate)
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk Checker</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 80mm;
          padding: 6px;
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #000;
          background: #fff;
          line-height: 1.2;
        }
        .checker-header {
          text-align: center;
          border: 2px solid #000;
          padding: 8px 4px;
          margin-bottom: 8px;
          background: #f0f0f0;
        }
        .checker-label {
          font-size: 18px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #000;
          margin-bottom: 4px;
          padding: 4px 0;
        }
        .checker-info {
          font-size: 10px;
          margin: 2px 0;
        }
        .checker-info strong {
          font-weight: bold;
        }
        .items-section {
          margin-bottom: 6px;
        }
        .items-title {
          font-size: 12px;
          font-weight: bold;
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .checker-item {
          display: flex;
          align-items: center;
          padding: 3px 0;
          border-bottom: 1px dotted #666;
          font-size: 11px;
        }
        .checker-item:last-child {
          border-bottom: none;
        }
        .item-quantity {
          font-weight: bold;
          margin-right: 6px;
          min-width: 25px;
        }
        .item-name {
          flex: 1;
        }
        .client-name {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .item-note {
          font-size: 9px;
          color: #333;
          font-style: italic;
          margin-left: 31px;
          margin-top: 1px;
        }
        .checker-footer {
          text-align: center;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #666;
          font-size: 9px;
        }
        .notes-section {
          margin-top: 6px;
          padding-top: 4px;
          border-top: 1px dashed #ccc;
          font-size: 9px;
        }
      </style>
    </head>
    <body>
      <div class="checker-header">
        <div class="checker-label">CHECKER</div>
        ${clientName ? `<div class="client-name">${escapeHtml(clientName)}</div>` : ''}
        <div class="checker-info"><strong>No. Pesanan ${checkerOrderNumber}</strong></div>
        <div class="checker-info">${formattedDate}</div>
      </div>

      <div class="items-section">
        <div class="items-title">Daftar Item</div>
        <div>
          ${cart.map((item) => `
            <div class="checker-item">
              <span class="item-quantity">${item.quantity}x</span>
              <span class="item-name">${escapeHtml(item.produk?.nama || 'Produk')}</span>
            </div>
            ${item.catatan?.trim() ? `<div class="item-note">Catatan: ${escapeHtml(item.catatan.trim())}</div>` : ''}
          `).join('')}
        </div>
      </div>

   
    </body>
    </html>
  `
}

export const printChecker = (
  cart: CartItemType[],
  formattedDate: string,
  orderDate: string | Date | undefined,
  clientName?: string
): Promise<void> => {
  if (cart.length === 0) {
    return Promise.resolve()
  }

  const date = orderDate ? new Date(orderDate) : new Date()

  const checkerReceiptContent = buildCheckerReceiptContent(
    cart,
    formattedDate,
    date,
    clientName
  )

  return printSingleReceipt(checkerReceiptContent, true)
}

