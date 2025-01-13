export const makeChainable = ({ ioc, methods, resolve }) =>
  new Proxy(ioc, {
    get(target, prop) {
      if (prop === 'resolve') {
        return resolve
      }

      if (methods.includes(prop)) {
        return (...args) => {
          target[prop](...args)
          return makeChainable({ ioc, methods, resolve })
        }
      }

      return target[prop]
    },
  })

/**
 * @returns {import('@exodus/dependency-types').Feature}
 */
export const createRpcFeature = (id, api) => ({
  id,
  definitions: [
    {
      // export module to IOC for consumption via dependencies
      definition: {
        id,
        type: 'module',
        public: true,
        factory: () => api,
      },
    },
    {
      // export API to SDK surface
      definition: {
        id: `${id}Api`,
        type: 'api',
        factory: () => ({
          [id]: api,
        }),
      },
    },
  ],
})
