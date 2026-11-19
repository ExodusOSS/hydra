import { createInMemoryAtom } from '@exodus/atoms'

import { localeLifecyclePluginDefinition } from '../index.js'

describe('localeLifecyclePluginDefinition', () => {
  let port
  let languageAtom
  let languageFusionAtom
  let currencyAtom
  let currencyFusionAtom
  let plugin

  beforeEach(() => {
    port = { emit: jest.fn() }
    languageAtom = createInMemoryAtom({ defaultValue: 'en' })
    languageFusionAtom = createInMemoryAtom()
    currencyAtom = createInMemoryAtom({ defaultValue: 'USD' })
    currencyFusionAtom = createInMemoryAtom()

    plugin = localeLifecyclePluginDefinition.factory({
      port,
      languageAtom,
      languageFusionAtom,
      currencyAtom,
      currencyFusionAtom,
    })
  })

  it('should observe languageFusionAtom and set non-undefined value to languageAtom', async () => {
    plugin.onStart()
    const spy = jest.spyOn(languageAtom, 'set')

    await languageFusionAtom.set(undefined)

    expect(spy).not.toHaveBeenCalled()

    await languageFusionAtom.set('ru')

    expect(spy).toHaveBeenCalledWith('ru')
  })

  it('should not set same value to languageAtom', async () => {
    plugin.onStart()
    const lang = 'ru'
    await languageAtom.set(lang)
    const spy = jest.spyOn(languageAtom, 'set')

    await languageFusionAtom.set(lang)

    expect(spy).not.toHaveBeenCalled()
  })

  it('should observe currencyFusionAtom and set non-undefined value to currencyAtom', async () => {
    plugin.onStart()
    const spy = jest.spyOn(currencyAtom, 'set')

    await currencyFusionAtom.set(undefined)

    expect(spy).not.toHaveBeenCalled()

    await currencyFusionAtom.set('EUR')

    expect(spy).toHaveBeenCalledWith('EUR')
  })

  it('should not set same value to currencyAtom', async () => {
    plugin.onStart()
    const currency = 'EUR'
    await currencyAtom.set(currency)
    const spy = jest.spyOn(currencyAtom, 'set')

    await currencyFusionAtom.set(currency)

    expect(spy).not.toHaveBeenCalled()
  })
})
