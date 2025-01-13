import { warnOnSameValueSet, swallowObserverErrors, timeoutObservers } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { namespaceLogger } from '../utils.js'

const wrapAtom = ({
  id,
  atom,
  logger,
  warnOnSameValueSetOpts,
  swallowObserverErrorsOpts,
  timeoutObserversOpts,
}) => {
  logger = namespaceLogger({ logger, namespace: id })
  if (warnOnSameValueSetOpts) atom = warnOnSameValueSet({ atom, logger, ...warnOnSameValueSetOpts })
  if (swallowObserverErrorsOpts)
    atom = swallowObserverErrors({ atom, logger, ...swallowObserverErrorsOpts })
  if (timeoutObserversOpts) atom = timeoutObservers({ atom, logger, ...timeoutObserversOpts })

  return atom
}

const devModeAtoms = ({
  logger,
  timeoutObservers: timeoutObserversOpts,
  warnOnSameValueSet: warnOnSameValueSetOpts,
  swallowObserverErrors: swallowObserverErrorsOpts,
}) => {
  const preprocess = ({ definition, ...rest }) => {
    if (!['atom', 'atom-collection'].includes(definition.type)) return { definition, ...rest }

    const { factory: originalFactory, ...definitionRest } = definition
    const factory = (opts) => {
      const wrapOpts = {
        logger,
        timeoutObserversOpts,
        warnOnSameValueSetOpts,
        swallowObserverErrorsOpts,
      }

      const result = originalFactory(opts)
      return definition.type === 'atom'
        ? wrapAtom({ id: definition.id, atom: result, ...wrapOpts })
        : mapValues(result, (atom, id) =>
            wrapAtom({ id: `${definition.id}.${id}`, atom, ...wrapOpts })
          )
    }

    return {
      ...rest,
      definition: {
        ...definitionRest,
        factory,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default devModeAtoms
