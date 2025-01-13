import typeforce from '@exodus/typeforce'
import assert from 'minimalistic-assert'

const nonEmptyString = (value) => typeof value === 'string' && !!value
const nonEmptyStringArray = (value) =>
  Array.isArray(value) && value.length > 0 && value.every(nonEmptyString)

const parseStorageOpts = (opts) => {
  typeforce(
    {
      namespace: typeforce.oneOf(nonEmptyString, nonEmptyStringArray),
      interfaceId: typeforce.maybe(nonEmptyString),
    },
    opts
  )

  return {
    interfaceId: opts.interfaceId || 'storage',
    namespace: Array.isArray(opts.namespace) ? opts.namespace : [opts.namespace],
  }
}

const namespaceStorage = () => {
  const preprocess = (opts) => {
    const { definition, storage, ...rest } = opts
    if (!storage) return opts

    const { namespace: namespaceArr, interfaceId: storageInterfaceId } = parseStorageOpts(storage)
    return {
      ...rest,
      definition: {
        ...definition,
        factory: (deps) => {
          assert(deps[storageInterfaceId], `expected param "${storageInterfaceId}"`)

          deps = {
            ...deps,
            [storageInterfaceId]: namespaceArr.reduce(
              (storage, part) => storage.namespace(part),
              deps[storageInterfaceId]
            ),
          }

          return definition.factory(deps)
        },
      },
    }
  }

  return { type: 'node', preprocess }
}

export default namespaceStorage
