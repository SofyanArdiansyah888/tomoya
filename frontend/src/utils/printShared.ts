export interface CartItemType {
  produk_id: number
  quantity: number
  produk: any
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

/**
 * Print a single receipt (helper function for internal use)
 */
export const printSingleReceipt = (
  receiptContent: string,
  isChecker: boolean = false
): Promise<void> => {
  return new Promise((resolve) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=80mm,height=auto')
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
      iframe.id = `receipt-print-iframe-${isChecker ? 'checker' : 'normal'}`
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
        iframeDoc.write(receiptContent)
        iframeDoc.close()

        iframe.onload = () => {
          setTimeout(() => {
            if (iframe.contentWindow && !hasPrinted) {
              executePrint(iframe.contentWindow)
              setTimeout(() => {
                iframe.remove()
                resolve()
              }, 1000)
            }
          }, 250)
        }

        // Fallback if onload doesn't fire
        setTimeout(() => {
          if (iframe.contentWindow && !hasPrinted) {
            executePrint(iframe.contentWindow)
            setTimeout(() => {
              iframe.remove()
              resolve()
            }, 1000)
          } else {
            resolve()
          }
        }, 500)
      } else {
        resolve()
      }
      return
    }

    // Write content to new window
    printWindow.document.open()
    printWindow.document.write(receiptContent)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        if (!hasPrinted) {
          executePrint(printWindow)
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close()
            }
            resolve()
          }, 500)
        }
      }, 250)
    }

    // Fallback if onload doesn't fire
    setTimeout(() => {
      if (!printWindow.closed && !hasPrinted) {
        executePrint(printWindow)
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.close()
          }
          resolve()
        }, 500)
      } else {
        resolve()
      }
    }, 500)
  })
}

