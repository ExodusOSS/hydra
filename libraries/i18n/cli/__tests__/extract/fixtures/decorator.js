import React from 'react'
import withI18n from './dependencies/with-i18n.js'

@withI18n
class SomeComponent extends React.PureComponent {
  renderBackups = () => {
    const { t } = this.props
    const entries = [{ prefix: 1 }, { prefix: 2 }]

    return entries.map((entry, i) => {
      const { prefix } = entry

      return prefix > 1 ? (
        <div key={i} title={t(`Prefixed with ${prefix}`)} />
      ) : (
        <div key={i} title={t(`Prefixed with “${prefix}”…`)} />
      )
    })
  }
}

export default SomeComponent
