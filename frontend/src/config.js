// Contacto. El número se define en frontend/.env (VITE_WHATSAPP_NUMBER).
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5490000000000';

export function whatsappLink(message = '') {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
