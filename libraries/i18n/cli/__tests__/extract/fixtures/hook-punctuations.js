import React from 'react'
import { useI18n } from '@exodus/i18n'

const SomeComponent = () => {
  const { t } = useI18n()

  const value = t('Wingardium Leviosa.')

  return <h1>{value}</h1>
}

export default SomeComponent
