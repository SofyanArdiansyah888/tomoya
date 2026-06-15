import { formatPrice } from '../lib/formatPrice'
import tomoyaLogo from '../assets/tomoya.svg'
import { CartItemType, getPaymentMethodLabel, printSingleReceipt, escapeHtml } from './printShared'
import { printChecker } from './printChecker'

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
 * Build normal receipt HTML content
 */
const buildReceiptContent = (
  cart: CartItemType[],
  total: number,
  paymentMethod: 'cash' | 'card' | 'qris' | 'other',
  notes: string | undefined,
  formattedDate: string,
  noPesanan: string | undefined,
  clientName?: string,
  uangDibayar?: number,
  kembalian?: number
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Struk Pembayaran</title>
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
          padding: 8px;
          font-family: Arial, sans-serif;
          font-size: 13px;
          color: #000;
          background: #fff;
          line-height: 1.3;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #666;
          padding-bottom: 6px;
          margin-bottom: 6px;
        }
        .header img {
          display: block;
          margin: 0 auto 6px;
          max-width: 80px;
          height: auto;
        }
        .header-line {
          width: 60px;
          height: 1px;
          background: #666;
          margin: 4px auto;
        }
        .header p {
          font-size: 14px;
          margin: 2px 0;
          line-height: 1.3;
        }
        .items {
          margin-bottom: 8px;
          margin-left:4px;
          margin-right:4px
        }
        .items-header {
          border-bottom: 1px dashed #666;
          padding-bottom: 4px;
          margin-bottom: 6px;
        }
        .items-header div {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .item {
          border-bottom: 1px dashed #ddd;
          padding-bottom: 4px;
          margin-bottom: 4px;
        }
        .item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 8px;
        }
        .item-info {
          flex: 1;
          min-width: 0;
        }
        .item-name {
          font-size: 13px;
          margin-bottom: 1px;
          line-height: 1.3;
        }
        .item-detail {
          font-size: 13px;
          color: black;
          line-height: 1.2;
        }
        .item-price {
          font-size: 12px;
          text-align: right;
          white-space: nowrap;
        }
        .total-section {
          border-top: 1px dashed #666;
          padding-top: 6px;
          margin-top: 8px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .total-label {
          font-weight: 600;
        }
        .total-value {
          font-weight: 600;
        }
        .payment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
          font-size: 12px;
        }
        .payment-label {
          color: black;
          font-size:12px;
        }
        .payment-value {
          font-weight: 500;
          font-size:12px;
        }
        .grand-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
          font-weight: bold;
          padding: 6px 4px;
          margin: 4px -4px 0;
          border-top: 1px dashed #666;
        }
        .grand-total-value {
          color: black;
        }
        .notes {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #ccc;
        }
        .notes div {
          font-size: 11px;
          line-height: 1.3;
        }
        .notes strong {
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 6px;
          border-top: 1px dashed #666;
        }
        .footer p {
          font-size: 12px;
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .footer .footer-text {
          font-weight: 500;
        }
        .footer .footer-subtext {
          color: black;
        }
        .footer .footer-line {
          margin-top: 6px;
          font-size: 9px;
          color: black;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${tomoyaLogo}" alt="Tomoya Icon" style="max-width: 80px; height: auto; margin-bottom: 4px;">
        <div class="header-line"></div>
        <p>Jl. Jend. Ahmad Yani</p>
        <p>Sengkang</p>
        <p style="margin-top: 4px; font-weight: 600;">${formattedDate}</p>
        <p style="margin-top: 2px;">No.Pesanan: ${noPesanan}</p>
        ${clientName ? `<p style="margin-top: 2px; font-weight: 600; text-transform: uppercase;">${escapeHtml(clientName)}</p>` : ''}
      </div>

      <div class="items">
        <div class="items-header">
          <div>Daftar Item</div>
        </div>
        <div>
          ${cart.map((item) => `
            <div class="item">
              <div class="item-row">
                <div class="item-info">
                  <div class="item-name">${item.produk?.nama || 'Produk'}</div>
                  <div class="item-detail" >
                    ${item.quantity} × ${formatPrice(item.produk?.harga || 0)}
                  </div>
                  ${item.catatan?.trim() ? `<div class="item-detail" style="font-style: italic;">Catatan: ${escapeHtml(item.catatan.trim())}</div>` : ''}
                </div>
                <div class="item-price" >
                  ${formatPrice((item.produk?.harga || 0) * item.quantity)}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="total-section">
        <div class="payment-row" >
          <span class="payment-label">Metode Pembayaran:</span>
          <span class="payment-value">${getPaymentMethodLabel(paymentMethod)}</span>
        </div>
        <div class="grand-total">
          <span>TOTAL:</span>
          <span class="grand-total-value">${formatPrice(total)}</span>
        </div>
        ${paymentMethod === 'cash' && uangDibayar !== undefined && uangDibayar > 0 ? `
          <div class="payment-row">
            <span class="payment-label">Uang Dibayar:</span>
            <span class="payment-value">${formatPrice(uangDibayar)}</span>
          </div>
          ${kembalian !== undefined && kembalian !== null ? `
            <div class="payment-row">
              <span class="payment-label">Kembalian:</span>
              <span class="payment-value">${formatPrice(kembalian)}</span>
            </div>
          ` : ''}
        ` : ''}
      </div>

      ${notes ? `
        <div class="notes">
          <div>
            <strong>Catatan:</strong> ${notes}
          </div>
        </div>
      ` : ''}

      <div class="footer">
        <p class="footer-text">Terima kasih atas kunjungan Anda</p>
        <p class="footer-subtext">Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
        
      </div>
    </body>
    </html>
  `
}

export const printReceipt = (
  cart: CartItemType[],
  total: number,
  paymentMethod: 'cash' | 'card' | 'qris' | 'other',
  notes?: string,
  orderDate?: string | Date,
  noPesanan?: string,
  clientName?: string,
  uangDibayar?: number,
  kembalian?: number
) => {
  if (cart.length === 0) {
    return
  }

  // Remove any existing print container and style
  const existingContainer = document.getElementById('receipt-print-temp')
  if (existingContainer) {
    existingContainer.remove()
  }
  const existingStyle = document.getElementById('receipt-print-style')
  if (existingStyle) {
    existingStyle.remove()
  }

  const date = orderDate ? new Date(orderDate) : new Date()
  const formattedDate = date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Generate order number if not provided
  const orderNumber = noPesanan || formatOrderNumber(date)

  // Build receipt content for normal receipt
  const normalReceiptContent = buildReceiptContent(
    cart,
    total,
    paymentMethod,
    notes,
    formattedDate,
    orderNumber,
    clientName,
    uangDibayar,
    kembalian
  )

  // Print normal receipt first, then checker receipt
  printSingleReceipt(normalReceiptContent, false).then(() => {
    // Wait a bit before printing checker receipt to ensure first print completes
    setTimeout(() => { 
      printChecker(cart, formattedDate, orderDate, clientName)
    }, 1000)
  })
}
