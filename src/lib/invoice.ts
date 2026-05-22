export interface InvoiceOrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface InvoiceOrder {
  id: string;
  date: string;
  total: number;
  status: string;
  items: InvoiceOrderItem[];
}

export function buildInvoiceHtml(order: InvoiceOrder, customerName: string, customerEmail: string) {
  const formattedDate = new Date(order.date).toLocaleDateString('es-CO');
  const lines = order.items.map((item) => `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">${item.name}${item.size ? ` - Talla ${item.size}` : ''}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align:right;">${item.quantity}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align:right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Factura ${order.id}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
      .invoice { max-width: 900px; margin: 0 auto; padding: 32px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
      .brand { font-weight: 800; font-size: 1.75rem; color: #0f172a; }
      .meta { text-align: right; }
      .meta p { margin: 0; font-size: 0.95rem; color: #475569; }
      .section { margin-top: 32px; }
      .section-title { font-size: 1rem; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: .08em; color: #334155; }
      .box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { padding: 14px 16px; }
      th { text-align: left; background: #f1f5f9; color: #475569; font-weight: 700; font-size: 0.95rem; }
      td { color: #334155; font-size: 0.95rem; }
      .total-row td { font-weight: 700; }
      .total-row td:last-child { text-align: right; }
      .footer { margin-top: 32px; font-size: 0.95rem; color: #64748b; }
    </style>
  </head>
  <body>
    <div class="invoice">
      <div class="header">
        <div>
          <div class="brand">StyleSavvy</div>
          <p style="margin: 12px 0 0; color: #64748b;">Factura de compra</p>
        </div>
        <div class="meta">
          <p><strong>Pedido:</strong> ${order.id}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Datos del cliente</div>
        <div class="box">
          <p style="margin: 0 0 8px;"><strong>${customerName}</strong></p>
          <p style="margin: 0; color: #64748b;">${customerEmail}</p>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Detalle de la compra</div>
        <div class="box">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th style="text-align:right;">Cantidad</th>
                <th style="text-align:right;">Precio unitario</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${lines}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="3">Total</td>
                <td style="text-align:right;">$${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div class="footer">
        <p>Gracias por comprar en StyleSavvy. Conserva esta factura como comprobante de tu compra.</p>
      </div>
    </div>
  </body>
</html>`;
}

export function downloadInvoiceHtml(order: InvoiceOrder, customerName: string, customerEmail: string) {
  const invoiceHtml = buildInvoiceHtml(order, customerName, customerEmail);
  const blob = new Blob([invoiceHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura-${order.id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
