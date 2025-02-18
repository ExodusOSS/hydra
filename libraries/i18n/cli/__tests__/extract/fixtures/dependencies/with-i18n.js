import { useI18n } from '@exodus/i18n'

export const withI18n = (Component) => (props) => {
  const i18n = useI18n()

  if (i18n === null) {
    console.warn('WARNING: outside of i18n context -- not translating strings')
    const fakeI18n = {
      t: (string) => string,
    }
    return <Component {...{ ...props, ...fakeI18n }} />
  }

  return <Component {...{ ...props, ...i18n }} />
}
