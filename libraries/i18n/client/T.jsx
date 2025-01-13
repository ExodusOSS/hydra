import React from 'react'

import formatTranslation from './format.js'
import useI18n from './useI18n.js'

const _T = ({ id, values, punctuations = {}, components = {} }) => {
  const { i18n } = useI18n()

  const translation = i18n.translate(id, { values, punctuations })

  return formatTranslation(translation, components)
}

export const T = React.memo(_T)

export const t = (id, { values, punctuations } = {}) => {
  return <T id={id} values={values} punctuations={punctuations} />
}
