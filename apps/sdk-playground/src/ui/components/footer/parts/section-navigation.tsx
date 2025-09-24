import type { ReactElement } from 'react'
import type { ContactProps } from './contact.js'
import { Contact } from './contact.js'

export type NavigationSectionProps = {
  children?: ReactElement
  contactSection?: ContactProps | null
}

export function NavigationSection({ children, contactSection }: NavigationSectionProps) {
  if (!contactSection && !children) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-12" aria-label="Footer contact">
      {contactSection !== null && <Contact {...contactSection} />}
      {children}
    </section>
  )
}
