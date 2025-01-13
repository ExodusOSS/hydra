export default function awaitProxy({
  object,
  delayUntil,
  allowedMethods = [],
  synchronousMethods = [],
}) {
  return new Proxy(object, {
    get(target, property) {
      if (synchronousMethods.includes(property)) {
        return function () {
          const resultPromise = delayUntil.then(() => target[property](...arguments))
          return new Proxy(
            {},
            {
              get(_, prop) {
                // return undefined for .then so the proxy doesn't look like a Promise,
                // just in case the proxy is awaited or returned from an async function
                if (prop === 'then') return

                return async function () {
                  const result = await resultPromise
                  return result[prop](...arguments)
                }
              },
            }
          )
        }
      }

      if (allowedMethods.includes(property)) return target[property]

      return async function () {
        await delayUntil
        return target[property](...arguments)
      }
    },
  })
}
