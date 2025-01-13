import React from 'react'
import withI18n from './dependencies/with-i18n.js'

@withI18n
class SomeComponent extends React.PureComponent {
  render = () => {
    const { t } = this.props
    return <div title={t('First line\nSecond line')} />
  }
}

export default SomeComponent
