import enforceObservableRules from '../enforce-rules.js'
import createSimpleObserver from '../simple-observer.js'
import type { Atom, Keystore, KeystoreValue } from '../utils/types.js'

type Params = {
  keystore: Keystore
  config: {
    key: string
    defaultValue?: KeystoreValue
    isSoleWriter?: boolean
    getOpts?: object
    setOpts?: object
    deleteOpts?: object
  }
}

const createKeystoreAtom = ({
  keystore,
  config: {
    //
    key,
    defaultValue,
    isSoleWriter,
    getOpts,
    setOpts,
    deleteOpts,
  },
}: Params): Atom<KeystoreValue | null> => {
  const { notify, observe } = createSimpleObserver<KeystoreValue | null>({ enable: isSoleWriter })

  const set = async (value: KeystoreValue | null) => {
    if (value == null) {
      await keystore.deleteSecret(key, deleteOpts)
    } else {
      await keystore.setSecret(key, value, setOpts)
    }

    if (isSoleWriter) await notify(value)
  }

  const get = () => keystore.getSecret(key, getOpts)

  return enforceObservableRules({
    get,
    set,
    observe,
    defaultValue,
  })
}

export default createKeystoreAtom
