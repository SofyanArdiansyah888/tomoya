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

/**
 * Print labels for cart items (32mm x 20mm)
 * Each item will be printed based on quantity
 */
export const printLabel = (
  cart: CartItemType[],
  clientName?: string,
  noPesanan?: string,
  orderDate?: string | Date
) => {
  if (cart.length === 0) {
    return
  }

  // Remove any existing print container and style
  const existingContainer = document.getElementById('label-print-temp')
  if (existingContainer) {
    existingContainer.remove()
  }
  const existingStyle = document.getElementById('label-print-style')
  if (existingStyle) {
    existingStyle.remove()
  }

  // Generate order number from date or use provided noPesanan
  const date = orderDate ? new Date(orderDate) : new Date()
  const orderNumber = noPesanan || formatOrderNumber(date)

  // Build labels HTML content - one label per item quantity
  const labelsContent = cart.map((item) => {
    // Create multiple labels based on quantity
    return Array.from({ length: item.quantity }, () => {
      const productName = escapeHtml(item.produk?.nama || 'Produk')
    
      return `
        <div class="label-page">
          <div class="label-content">
            <div class="label-order">No. Pesanan: ${orderNumber}</div>
            ${clientName ? `<div class="label-client" style="margin-top:6px">${escapeHtml(clientName)}</div>` : ''}
            <div class="label-name" style="text-transform:uppercase;margin-top:6px">${productName}</div>
          </div>
        </div>
      `
    }).join('')
  }).join('')

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
          font-family: Arial, sans-serif;
          color: #000;
          background: #fff;
        }
        .label-page {
          width: 32mm;
          height: 20mm;
          min-height: 20mm;
          display: flex;
          align-items: center;
          justify-content: center;
          page-break-after: always;
          page-break-inside: avoid;
          page-break-before: auto;
          box-sizing: border-box;
          border: 1px dashed #ccc;
          margin: 0;
        }
        .label-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.5mm 1mm;
          box-sizing: border-box;
        }
        .label-name {
          font-size: 8px;
          font-weight: bold;
          line-height: 1.1;
          word-wrap: break-word;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          flex-shrink: 0;
          margin-bottom: 0.3mm;
        }
        .label-code {
          font-size: 6px;
          font-weight: bold;
          color: black;
          line-height: 1;
          flex-shrink: 0;
          margin-bottom: 0.2mm;
        }
        .label-price {
          font-size: 9px;
          font-weight: bold;
          color: black;
          flex-shrink: 0;
          margin-top: 0.2mm;
        }
        .label-client {
          font-weight: bold;
          font-size: 7px;
          color: black;
          line-height: 1;
          flex-shrink: 0;
          margin-bottom: 0.2mm;
          text-transform: uppercase;
        }
        .label-order {
          font-weight: bold;
          font-size: 6px;
          color: black;
          line-height: 1;
          flex-shrink: 0;
          margin-bottom: 0.1mm;
        }
      </style>
    </head>
    <body>
      ${labelsContent}
    </body>
    </html>
  `

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600')
  let hasPrinted = false

  const executePrint = (windowToPrint: Window) => {
    if (hasPrinted) return
    hasPrinted = true
    windowToPrint.focus()
    windowToPrint.print()
  }

  if (!printWindow) {
    // Fallback: if popup is blocked, use iframe approach
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

      // Fallback if onload doesn't fire
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

  // Write content to new window
  printWindow.document.open()
  printWindow.document.write(labelPrintContent)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      if (!hasPrinted) {
        executePrint(printWindow)
        // Don't close immediately, let user see preview
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close()
          }
        }, 1000)
      }
    }, 500)
  }

  // Fallback if onload doesn't fire
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

