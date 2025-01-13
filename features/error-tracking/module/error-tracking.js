const MODULE_ID = 'errorTracking'

const createErrorTracking = ({ errorsAtom, config }) => {
  const track = async ({ error, context, namespace }) => {
    if (!namespace) {
      throw new Error('no namespace provided')
    }

    return errorsAtom.set(({ errors }) => {
      return {
        // this array can be big. not sure about prefering spread operator here
        // concat function seems like a better option
        errors: [{ namespace, error, context, time: Date.now() }]
          // eslint-disable-next-line unicorn/prefer-spread
          .concat(errors)
          .slice(0, config.maxErrorsCount),
      }
    })
  }

  return { track }
}

export const errorTrackingDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createErrorTracking,
  dependencies: ['config', 'errorsAtom'],
  public: true,
}
