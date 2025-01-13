import EventEmitter from 'node:events'

import atomTests from '@exodus/atom-tests'
import type { Atom } from '@exodus/atoms'
import { set as setValueAtPath } from '@exodus/basic-utils'
import delay from 'delay'
import lodash from 'lodash'

import { createRemoteConfigAtomFactory } from '../src/index.js'

const createRemoteConfigStub = () => {
  return new (class extends EventEmitter {
    all: any

    sync(data: any) {
      this.all = data
      this.emit('sync', { current: data })
    }

    getAll() {
      return this.all
    }
  })()
}

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

    remoteConfig.sync({
      name: 'Harry Potter',
      book: "Harry Potter and the Philosopher's Stone",
      spells: ['Lumos'],
    })

    await new Promise(setImmediate)

    remoteConfig.sync({
      name: 'Harry Potter',
      book: 'Harry Potter and the Deathly Hallows',
      spells: ['Lumos'],
    })

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(['Lumos'])
  })

  describe('atom test suite', () => {
    const path = 'a.b.c'

    const createRemoteConfigMock = (initialValue: any): any => {
      const currentValue = lodash.cloneDeep(initialValue)

      const emitter = new EventEmitter()
      return Object.assign(emitter, {
        // delay to facilitate testing race conditions
        get: async (key: string) => delay(1).then(() => lodash.get(currentValue, key)),
        getAll: async () => delay(1).then(() => currentValue),
        _set: async (path: string, value: any) => {
          setValueAtPath(currentValue, path, value)
          emitter.emit('sync', { current: currentValue })
        },
      })
    }

    type FactoryParams = {
      defaultValue?: any
      initialValue?: any
    }

    type FactoryReturnValue = {
      atom: Atom<any>
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
          const remoteConfig = createRemoteConfigMock(setValueAtPath({}, path, initialValue))
          return {
            atom: createRemoteConfigAtomFactory({ remoteConfig })({
              path,
              defaultValue,
            }),
            // for atoms that support set(), this should be atom.set
            set: (value) => remoteConfig._set(path, value),
          }
        },
        isWritable: false,
        isObservable: true,
      },
      {
        name: 'remoteConfig',
        factory: ({ defaultValue, initialValue } = {}) => {
          const remoteConfig = createRemoteConfigMock(setValueAtPath({}, path, initialValue))
          return {
            atom: createRemoteConfigAtomFactory({ remoteConfig })({
              selector: (data) => lodash.get(data, path),
              defaultValue,
            }),
            // for atoms that support set(), this should be atom.set
            set: (value) => remoteConfig._set(path, value),
          }
        },
        isWritable: false,
        isObservable: true,
      },
    ]

    cases.forEach(atomTests)
  })
})
