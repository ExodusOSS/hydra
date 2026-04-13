// eslint-disable-next-line no-restricted-imports
import lodash from 'lodash'
import { createAtomObserver } from '@exodus/atoms'

const { isEqual } = lodash

const createUiConfigPluginDefinition = ({ configValues }) => {
  const atomIds = configValues.map((v) => v.atomId)
  const syncableAtomIds = configValues.filter((v) => v.syncable).map((v) => `syncable${v.atomId}`)

  const factory = ({ port, ...atoms }) => {
    const items = configValues.map(({ id, atomId, ...config }) => ({
      atom: atoms[atomId],
      observer: createAtomObserver({ port, atom: atoms[atomId], event: id }),
      config,
    }))

    const syncAtoms = () => {
      const subscriptions = []

      configValues
        .filter((config) => config.syncable)
        .forEach((config) => {
          const localAtom = atoms[config.atomId]
          const remoteAtom = atoms[`syncable${config.atomId}`]
          // note: do not subscribe them to each other at the same time
          // to avoid a flip flow loop. Sync local to the remote value first, then subscribe

          let subscribedToLocal = false
          subscriptions.push(
            remoteAtom.observe((value) => {
              if (value !== undefined) {
                localAtom.set((prevValue) => (isEqual(value, prevValue) ? prevValue : value))
              }

              if (subscribedToLocal) return

              subscribedToLocal = true
              subscriptions.push(
                localAtom.observe((value) => {
                  if (value !== undefined) {
                    remoteAtom.set((prevValue) => (isEqual(value, prevValue) ? prevValue : value))
                  }
                })
              )
            })
          )
        })

      return () => {
        subscriptions.forEach((unsubscribe) => unsubscribe())
      }
    }

    let unsubscribeSyncAtoms = () => {}
    return {
      onLoad: () => items.forEach(({ observer }) => observer.start()),
      onStart: () => {
        items.forEach(({ observer }) => observer.start())
        unsubscribeSyncAtoms = syncAtoms()
      },
      onClear: () =>
        Promise.all(items.map(({ atom, config }) => (config.persist ? null : atom.set(undefined)))),
      onStop: () => {
        items.forEach(({ observer }) => observer.unregister())
        unsubscribeSyncAtoms()
      },
    }
  }

  return {
    definition: {
      type: 'plugin',
      id: 'uiConfigPlugin',
      factory,
      dependencies: ['port', ...atomIds, ...syncableAtomIds],
      public: true,
    },
  }
}

export default createUiConfigPluginDefinition
