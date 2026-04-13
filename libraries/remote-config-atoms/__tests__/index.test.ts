import atomTests from '@exodus/atom-tests'
import type { ReadonlyAtom } from '@exodus/atoms'
import { createInMemoryAtom } from '@exodus/atoms'
import { set as setValueAtPath } from '@exodus/basic-utils'
import type { RemoteConfigData } from '@exodus/remote-config'
import lodash from 'lodash'

import { createRemoteConfigAtomFactory } from '../src/index.js'

const createRemoteConfigStub = (config: any = {}): any => ({
  remoteConfigAtom: createInMemoryAtom<RemoteConfigData>({ defaultValue: { config } }),
})

describe('createRemoteConfigAtomFactory', () => {
  let remoteConfig: ReturnType<typeof createRemoteConfigStub>
  let createRemoteConfigAtom: ReturnType<typeof createRemoteConfigAtomFactory>

  beforeEach(() => {
    remoteConfig = createRemoteConfigStub()

    createRemoteConfigAtom = createRemoteConfigAtomFactory({
      remoteConfig: remoteConfig as never,
    })
  })

  it('should not emit the same value twice', async () => {
    const atom = createRemoteConfigAtom({ path: 'spells' })
    const handler = jest.fn()
    atom.observe(handler)

    const config = {
      name: 'Harry Potter',
      book: "Harry Potter and the Philosopher's Stone",
      spells: ['Lumos'],
    }

    await remoteConfig.remoteConfigAtom.set({ config })
    await remoteConfig.remoteConfigAtom.set({ config })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(['Lumos'])
  })

  describe('atom test suite', () => {
    const path = 'a.b.c'

    type FactoryParams = {
      defaultValue?: any
      initialValue?: any
    }

    type FactoryReturnValue = {
      atom: ReadonlyAtom<any>
      set?: (value: any) => Promise<void>
    }

    const cases: {
      name: string
      factory: (params: FactoryParams) => FactoryReturnValue
      isWritable: boolean
      isObservable: boolean
    }[] = [
      {
        name: 'remoteConfig',
        factory: ({ defaultValue, initialValue } = {}) => {
          const remoteConfig = createRemoteConfigStub(setValueAtPath({}, path, initialValue))
          return {
            atom: createRemoteConfigAtomFactory({ remoteConfig })({
              path,
              defaultValue,
            }),
            // for atoms that support set(), this should be atom.set
            set: (value) =>
              remoteConfig.remoteConfigAtom.set({ config: setValueAtPath({}, path, value) }),
          }
        },
        isWritable: false,
        isObservable: true,
      },
      {
        name: 'remoteConfig',
        factory: ({ defaultValue, initialValue } = {}) => {
          const remoteConfig = createRemoteConfigStub(setValueAtPath({}, path, initialValue))
          return {
            atom: createRemoteConfigAtomFactory({ remoteConfig })({
              selector: (data) => lodash.get(data, path),
              defaultValue,
            }),
            // for atoms that support set(), this should be atom.set
            set: (value) =>
              remoteConfig.remoteConfigAtom.set({ config: setValueAtPath({}, path, value) }),
          }
        },
        isWritable: false,
        isObservable: true,
      },
    ]

    cases.forEach(atomTests)
  })
})
