import atomTests from '@exodus/atom-tests'
import { set as setValueAtPath } from '@exodus/basic-utils'

import type { Fusion } from './index.js'
import { createFusionAtom } from './index.js'

const path = 'a.b.c'

atomTests({
  name: 'fusion',
  factory: (
    { defaultValue, initialValue } = {} as {
      defaultValue?: unknown
      initialValue?: unknown
      logger?: unknown
    }
  ) => {
    let profile = setValueAtPath({}, path, initialValue)
    const subscribers: ((profile: object) => void)[] = []

    const fusion: Fusion = {
      subscribe: (callback: (profile: object) => void) => {
        subscribers.push(callback)
        return () => {
          subscribers.splice(subscribers.indexOf(callback), 1)
        }
      },
      getProfile: async () => profile,
      mergeProfile: async (newProfile: object) => {
        profile = newProfile as ReturnType<typeof setValueAtPath>
        subscribers.forEach((callback) => callback(profile))
      },
    }

    const atom = createFusionAtom({
      fusion,
      path,
      defaultValue,
    })

    return {
      atom,
      set: atom.set,
    }
  },
  isWritable: true,
  // added this test case for testing  if you want to test the observability you'll need to create a more sophisticated fusion fake
  isObservable: false,
})
