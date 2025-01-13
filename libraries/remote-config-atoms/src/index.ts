import lodash from 'lodash'

import type { Listener } from '@exodus/atoms'
import { createSimpleObserver, enforceObservableRules } from '@exodus/atoms'
import type { RemoteConfigType } from '@exodus/remote-config'

const { get: getValueAtPath, isEqual } = lodash

type FactoryParams = {
  remoteConfig: RemoteConfigType
}

type Params<T> = { defaultValue?: T } & ({ path: string } | { selector: (config: object) => T })

export const createRemoteConfigAtomFactory =
  ({ remoteConfig }: FactoryParams) =>
  <T>({ defaultValue, ...params }: Params<T>) => {
    if ('path' in params && 'selector' in params) {
      throw new Error(
        'Provide either a path or a selector to get data from remote config - not both.'
      )
    }

    const getValue = (value: object): T =>
      'path' in params ? getValueAtPath(value, params.path) : params.selector(value)

    const { notify, observe } = createSimpleObserver<T>()

    const get = async () => {
      const data = await remoteConfig.getAll()
      return getValue(data)
    }

    const set = async () => {
      throw new Error('remoteConfig is read-only')
    }

    remoteConfig.on('sync', async ({ current }: { current: object }) => {
      const data = getValue(current)
      return notify(data)
    })

    const observeDistinct = (callback: Listener<T>) =>
      observe(
        function (this: { lastValue?: T }, value: T) {
          if (isEqual(this.lastValue, value)) return
          this.lastValue = value
          callback(value)
        }.bind(Object.create(null))
      )

    return enforceObservableRules({
      get,
      set,
      observe: observeDistinct,
      defaultValue,
    })
  }
