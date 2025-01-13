import React from 'react'
import { useI18n } from '@exodus/i18n'

const SomeComponent = () => {
  const { t } = useI18n()

  const value = t('"Yer a wizard Harry." ― Rubeus Hagrid')

  return <h1>{value}</h1>
}

export default SomeComponent
