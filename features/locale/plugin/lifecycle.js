import { createAtomObserver } from '@exodus/atoms'

const createLocalePlugin = ({ languageAtom, port, currencyAtom }) => {
  const languageAtomObserver = createAtomObserver({
    port,
    atom: languageAtom,
    event: 'language',
  })

  const currencyAtomObserver = createAtomObserver({
    port,
    atom: currencyAtom,
    event: 'currency',
  })

  const onStart = () => {
    languageAtomObserver.register()
    currencyAtomObserver.register()
  }

  const onLoad = () => {
    languageAtomObserver.start()
    currencyAtomObserver.start()
  }

  const onStop = () => {
    languageAtomObserver.unregister()
    currencyAtomObserver.unregister()
  }

  const onClear = async () => {
    await languageAtom.set(undefined)
  }

  return { onClear, onLoad, onStop, onStart }
}

export default createLocalePlugin
