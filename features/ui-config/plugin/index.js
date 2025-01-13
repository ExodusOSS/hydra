import { createAtomObserver } from '@exodus/atoms'

const createUiConfigPluginDefinition = ({ configValues }) => {
  const atomIds = configValues.map((v) => v.atomId)

  const factory = ({ port, ...atoms }) => {
    const items = configValues.map(({ id, atomId, ...config }) => ({
      atom: atoms[atomId],
      observer: createAtomObserver({ port, atom: atoms[atomId], event: id }),
      config,
    }))

    return {
      onLoad: () => items.forEach(({ observer }) => observer.start()),
      onStart: () => items.forEach(({ observer }) => observer.start()),
      onClear: () =>
        Promise.all(items.map(({ atom, config }) => (config.persist ? null : atom.set(undefined)))),
      onStop: () => items.forEach(({ observer }) => observer.unregister()),
    }
  }

  return {
    definition: {
      type: 'plugin',
      id: 'uiConfigPlugin',
      factory,
      dependencies: ['port', ...atomIds],
      public: true,
    },
  }
}

export default createUiConfigPluginDefinition
