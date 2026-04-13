// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import { compute } from '@exodus/atoms'
import type { Atom } from '@exodus/atoms'
import type { RemoteConfigData, RemoteConfigType } from '@exodus/remote-config'

const { get: getValueAtPath } = lodash

type FactoryParams = {
  remoteConfig: RemoteConfigType
}

type Params<T> = { defaultValue?: T } & ({ path: string } | { selector: (config: object) => T })

type AtomFactoryParams = {
  remoteConfigAtom: Atom<RemoteConfigData>
}

// @deprecated use `createRemoteConfigComputeAtomFactory` instead
export const createRemoteConfigAtomFactory = ({ remoteConfig }: FactoryParams) =>
  createRemoteConfigComputeAtomFactory({ remoteConfigAtom: remoteConfig.remoteConfigAtom })

export const createRemoteConfigComputeAtomFactory =
  ({ remoteConfigAtom }: AtomFactoryParams) =>
  <T>({ defaultValue, ...params }: Params<T>) => {
    if ('path' in params && 'selector' in params) {
      throw new Error(
        'Provide either a path or a selector to get data from remote config - not both.'
      )
    }

    return compute({
      atom: remoteConfigAtom,
      selector: (value: RemoteConfigData): T =>
        'path' in params
          ? getValueAtPath(value.config, params.path, defaultValue)
          : (params.selector(value.config!) ?? defaultValue!),
    })
  }
