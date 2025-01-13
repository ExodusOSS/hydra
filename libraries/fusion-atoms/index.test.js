import atomTests from '@exodus/atom-tests'
import { set as setValueAtPath } from '@exodus/basic-utils'
import { createFusionAtom } from './index.js'

const path = 'a.b.c'

atomTests({
  name: 'fusion',
  factory: ({ defaultValue, initialValue, logger } = {}) => {
    let profile = setValueAtPath({}, path, initialValue)
    const subscribers = []

    const fusion = {
      subscribe: (callback) => {
        subscribers.push(callback)
        return () => {
          subscribers.splice(subscribers.indexOf(callback), 1)
        }
      },
      getProfile: () => profile,
      mergeProfile: async (newProfile) => {
        profile = newProfile
        subscribers.forEach((callback) => callback(profile))
      },
    }

    const atom = createFusionAtom({
      fusion,
      logger,
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
