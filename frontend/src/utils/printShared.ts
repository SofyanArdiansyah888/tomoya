export interface CartItemType {
  produk_id: number
  quantity: number
  produk: any
  coffee_strength?: 'strong' | 'medium' | 'soft' | 'other'
  coffee_grams?: number
  catatan?: string 
}

export const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    cash: 'Tunai', 
    card: 'Kartu',
    qris: 'QRIS',
    other: 'Lainnya'
  }
  return labels[method] || method
}

/**
 * Escape HTML to prevent XSS and rendering issues
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const PRINT_GAP_MS = 300

type PrintHtmlDocumentOptions = {
  iframeId?: string
  windowSize?: string
}

/**
 * Print HTML content and wait until the print dialog closes before resolving.
 */
export const printHtmlDocument = (
  htmlContent: string,
  options: PrintHtmlDocumentOptions = {}
): Promise<void> => {
  const {
    iframeId = 'html-print-iframe',
    windowSize = 'width=80mm,height=auto',
  } = options

  return new Promise((resolve) => {
    let hasPrinted = false
    let resolved = false

    const finish = (cleanup?: () => void) => {
      if (resolved) return
      resolved = true
      cleanup?.()
      setTimeout(resolve, PRINT_GAP_MS)
    }

    const executePrint = (windowToPrint: Window, cleanup?: () => void) => {
      if (hasPrinted) return
      hasPrinted = true
      windowToPrint.focus()

      const fallbackTimeout = window.setTimeout(() => finish(cleanup), 120_000)
      windowToPrint.addEventListener(
        'afterprint',
        () => {
          window.clearTimeout(fallbackTimeout)
          finish(cleanup)
        },
        { once: true }
      )

      windowToPrint.print()
    }

    const printWindow = window.open('', '_blank', windowSize)

    if (!printWindow) {
      const iframe = document.createElement('iframe')
      iframe.id = iframeId
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) {
        finish()
        return
      }

      iframeDoc.open()
      iframeDoc.write(htmlContent)
      iframeDoc.close()

      const cleanup = () => iframe.remove()
      const triggerPrint = () => {
        if (iframe.contentWindow && !hasPrinted) {
          executePrint(iframe.contentWindow, cleanup)
        } else if (!resolved) {
          finish(cleanup)
        }
      }

      iframe.onload = () => setTimeout(triggerPrint, 250)
      setTimeout(triggerPrint, 500)
      return
    }

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    const cleanup = () => {
      if (!printWindow.closed) {
        printWindow.close()
      }
    }

    const triggerPrint = () => {
      if (!printWindow.closed && !hasPrinted) {
        executePrint(printWindow, cleanup)
      } else if (!resolved) {
        finish(cleanup)
      }
    }

    printWindow.onload = () => setTimeout(triggerPrint, 250)
    setTimeout(triggerPrint, 500)
  })
}

/**
 * Print a single receipt (helper function for internal use)
 */
export const printSingleReceipt = (
  receiptContent: string,
  isChecker: boolean = false
): Promise<void> => {
  return printHtmlDocument(receiptContent, {
    iframeId: `receipt-print-iframe-${isChecker ? 'checker' : 'normal'}`,
    windowSize: 'width=80mm,height=auto',
  })
}

