export const sharePdfViaWhatsapp = (message: string) => {
  // For security reasons, direct file sharing via WhatsApp Web API is not straightforward
  // without a backend or specific WhatsApp Business API integration.
  // The user will need to download the PDF first and then manually attach it.
  // This function will open WhatsApp Web with the pre-filled message.
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")
}
