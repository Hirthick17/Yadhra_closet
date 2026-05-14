// src/lib/whatsapp.ts
// WHY this file exists: WhatsApp URL construction logic is isolated here.
// The checkout component just calls buildWhatsAppURL() — it never knows
// about wa.me format, encoding, or number formatting.

export interface WhatsAppOrderPayload {
  orderId:  string;
  customer: string;
  items:    Array<{ name: string; size?: string; color?: string; quantity: number; price: number }>;
  total:    number;
  address:  string;
}

export function buildWhatsAppURL(payload: WhatsAppOrderPayload): string {
  const phone = import.meta.env.VITE_SELLER_WHATSAPP_NUMBER;
  if (!phone) throw new Error('VITE_SELLER_WHATSAPP_NUMBER not set in .env');

  const itemLines = payload.items
    .map(i => {
      const attrs: string[] = [];
      if (i.size)  attrs.push(`Size: ${i.size}`);
      if (i.color) attrs.push(`Colour: ${i.color}`);
      const attrStr = attrs.length ? ` (${attrs.join(', ')})` : '';
      return `  • ${i.name}${attrStr} × ${i.quantity} = ₹${(i.price * i.quantity).toLocaleString('en-IN')}`;
    })
    .join('\n');

  const message = [
    `🛍️ New Order from Yadhra Closet`,
    `Order ID: ${payload.orderId}`,
    `Customer: ${payload.customer}`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Total: ₹${payload.total.toLocaleString('en-IN')}`,
    ``,
    `Delivery Address:`,
    payload.address,
    ``,
    `Please confirm this order and share payment details. 🙏`,
  ].join('\n');

  // wa.me format: https://wa.me/<phone>?text=<encoded_message>
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
