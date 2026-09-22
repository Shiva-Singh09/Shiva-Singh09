/*
 * Contact configuration — real, known values only.
 * WhatsApp link is derived from the phone number on record.
 * LinkedIn is left null because no exact URL is known (do not invent one).
 * Each entry declares an icon key used by the Contact component.
 */
export const contactInfo = {
  email: {
    label: 'Email Me',
    icon: 'email',
    href: 'mailto:shivasingh09114@gmail.com',
    value: 'shivasingh09114@gmail.com',
  },
  phone: {
    label: 'Call Me',
    icon: 'phone',
    href: 'tel:+918303872467',
    value: '+91 8303872467',
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: 'whatsapp',
    href: 'https://wa.me/918303872467',
    value: 'Chat on WhatsApp',
  },
  github: {
    label: 'GitHub',
    icon: 'github',
    href: 'https://github.com/Shiva-Singh09',
    value: 'github.com/Shiva-Singh09',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'linkedin',
    href: null,
    value: 'Link not yet available',
  },
}

export const contactMethods = [
  contactInfo.github,
  contactInfo.email,
  contactInfo.phone,
  contactInfo.whatsapp,
  contactInfo.linkedin,
]
