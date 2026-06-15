import { CartItemType, escapeHtml } from './printShared'

/**
 * Format order number: DD-MM-YY-HHMM
 * Example: 11-11-25-1318 (11 Nov 2025, 13:18)
 */
const formatOrderNumber = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}-${month}-${year}-${hours}${minutes}`
}

const formatCoffeeStrength = (
  strength?: CartItemType['coffee_strength'],
  grams?: number
): string | null => {
  if (!strength) return null

  const labels: Record<string, string> = {
    strong: 'STRONG',
    medium: 'MEDIUM',
    soft: 'SOFT',
  }

  if (strength === 'other') {
    return typeof grams === 'number' && grams > 0 ? `CUSTOM ${grams}g` : 'CUSTOM'
  }

  return labels[strength] ?? strength.toUpperCase()
}

const buildLabelHtml = (
  item: CartItemType,
  orderNumber: string,
  clientName?: string,
): string => {
  const productName = escapeHtml(item.produk?.nama || 'Produk')
  const strengthLabel = formatCoffeeStrength(item.coffee_strength, item.coffee_grams)
  const trimmedNotes = item.catatan?.trim()

  return `
    <div class="label-page">
      <div class="label-content">
        <div class="label-meta">${escapeHtml(orderNumber)}</div>

        <div class="label-main">
          <div class="label-name">${productName}</div>
          ${strengthLabel ? `<div class="label-strength">· ${escapeHtml(strengthLabel)}</div>` : ''}
        </div>

        ${trimmedNotes ? `<div class="label-notes">${escapeHtml(trimmedNotes)}</div>` : ''}
        ${clientName ? `<div class="label-client">${escapeHtml(clientName)}</div>` : ''}
      </div>
    </div>
  `
}

/**
 * Print labels for cart items (32mm x 20mm)
 * Each item will be printed based on quantity
 */
export const printLabel = (
  cart: CartItemType[],
  clientName?: string,
  noPesanan?: string,   
  orderDate?: string | Date,
) => {
  if (cart.length === 0) {
    return
  }

  const existingContainer = document.getElementById('label-print-temp')
  if (existingContainer) {
    existingContainer.remove()
  }
  const existingStyle = document.getElementById('label-print-style')
  if (existingStyle) {
    existingStyle.remove()
  }

  const date = orderDate ? new Date(orderDate) : new Date()
  const orderNumber = noPesanan || formatOrderNumber(date)

  const labelsContent = cart
    .map((item) =>
      Array.from({ length: item.quantity }, () =>
        buildLabelHtml(item, orderNumber, clientName)
      ).join('')
    )
    .join('')

  const labelPrintContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Label Produk</title>
      <style>
        @page {
          size: 32mm 20mm;
          margin: 0;
        }
        @media print {
          @page {
            size: 32mm 20mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .label-page {
            page-break-after: always;
            page-break-inside: avoid;
            page-break-before: auto;
            border: none !important;
          }
          .label-page:last-child {
            page-break-after: auto;
          }
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          width: 32mm;
          height: auto;
          min-height: 20mm;
          padding: 0;
          margin: 0;
          font-family: Arial, Helvetica, sans-serif;
          color: #000;
          background: #fff;
        }
        .label-page {
          width: 32mm;
          height: 20mm;
          min-height: 20mm;
          page-break-after: always;
          page-break-inside: avoid;
          box-sizing: border-box;
          border: 1px dashed #ccc;
          margin: 0;
        }
        .label-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: stretch;
          text-align: left;
          padding: 0.8mm 1.1mm;
          gap: 0.4mm;
        }
        .label-meta {
          font-size: 5px;
          font-weight: 700;
          line-height: 1;
          letter-spacing: 0.03em;
          color: #000;
          border-bottom: 0.4px solid #000;
          padding-bottom: 0.45mm;
          flex-shrink: 0;
        }
        .label-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.35mm;
          min-height: 0;
        }
        .label-name {
          font-size: 8px;
          font-weight: 800;
          line-height: 1.05;
          text-transform: uppercase;
          word-wrap: break-word;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .label-strength {
          font-size: 4.5px;
          font-weight: 600;
          line-height: 1;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          align-self: flex-start;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: #333;
        }
        .label-notes {
          font-size: 5.5px;
          font-weight: 600;
          font-style: italic;
          line-height: 1.1;
          color: #000;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          flex-shrink: 0;
        }
        .label-client {
          font-size: 6px;
          font-weight: 700;
          line-height: 1;
          text-transform: uppercase;
          color: #000;
          border-top: 0.3px solid #999;
          padding-top: 0.35mm;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex-shrink: 0;
        }
      </style>
    </head>
    <body>
      ${labelsContent}
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=800,height=600')
  let hasPrinted = false

  const executePrint = (windowToPrint: Window) => {
    if (hasPrinted) return
    hasPrinted = true
    windowToPrint.focus()
    windowToPrint.print()
  }

  if (!printWindow) {
    const iframe = document.createElement('iframe')
    iframe.id = 'label-print-iframe'
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(labelPrintContent)
      iframeDoc.close()

      iframe.onload = () => {
        setTimeout(() => {
          if (iframe.contentWindow && !hasPrinted) {
            executePrint(iframe.contentWindow)
            setTimeout(() => {
              iframe.remove()
            }, 1000)
          }
        }, 500)
      }

      setTimeout(() => {
        if (iframe.contentWindow && !hasPrinted) {
          executePrint(iframe.contentWindow)
          setTimeout(() => {
            iframe.remove()
          }, 1000)
        }
      }, 1000)
    }
    return
  }

  printWindow.document.open()
  printWindow.document.write(labelPrintContent)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      if (!hasPrinted) {
        executePrint(printWindow)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close()
          }
        }, 1000)
      }
    }, 500)
  }

  setTimeout(() => {
    if (printWindow && !printWindow.closed && !hasPrinted) {
      executePrint(printWindow)
      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.close()
        }
      }, 1000)
    }
  }, 1000)
}
