import { swallowObserverErrors, timeoutObservers, warnOnSameValueSet } from '@exodus/atoms'
import type { Atom, Logger as AtomsLogger } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'
import { namespaceLogger } from '../utils.js'
import type { NodePreprocessor } from '../types.js'

type Logger = Record<string, (...args: unknown[]) => unknown>

type DevModeAtomsOptions = {
  logger: Logger
  timeoutObservers?: Record<string, unknown>
  warnOnSameValueSet?: Record<string, unknown>
  swallowObserverErrors?: Record<string, unknown>
}

const wrapAtom = ({
  id,
  atom,
  logger,
  warnOnSameValueSetOpts,
  swallowObserverErrorsOpts,
  timeoutObserversOpts,
}: {
  id: string
  atom: Atom<unknown>
  logger: Logger
  warnOnSameValueSetOpts?: Record<string, unknown>
  swallowObserverErrorsOpts?: Record<string, unknown>
  timeoutObserversOpts?: Record<string, unknown>
}) => {
  let wrappedAtom: Atom<unknown> = atom
  const namespacedLogger = namespaceLogger({ logger, namespace: id })

  if (warnOnSameValueSetOpts) {
    wrappedAtom = warnOnSameValueSet({
      atom: wrappedAtom,
      logger: namespacedLogger as AtomsLogger,
      ...warnOnSameValueSetOpts,
    })
  }

  if (swallowObserverErrorsOpts) {
    wrappedAtom = swallowObserverErrors({
      atom: wrappedAtom,
      logger: namespacedLogger as AtomsLogger,
      ...swallowObserverErrorsOpts,
    })
  }

  if (timeoutObserversOpts) {
    wrappedAtom = timeoutObservers({
      atom: wrappedAtom,
      ...(timeoutObserversOpts as { timeout: number }),
    })
  }

  return wrappedAtom
}

const devModeAtoms = ({
  logger,
  timeoutObservers: timeoutObserversOpts,
  warnOnSameValueSet: warnOnSameValueSetOpts,
  swallowObserverErrors: swallowObserverErrorsOpts,
}: DevModeAtomsOptions): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = ({ definition, ...rest }) => {
    if (!['atom', 'atom-collection'].includes(String(definition.type))) {
      return { definition, ...rest }
    }

    const { factory: originalFactory, ...definitionRest } = definition
    const factory = (opts: Record<string, unknown>) => {
      const wrapOpts = {
        logger,
        timeoutObserversOpts,
        warnOnSameValueSetOpts,
        swallowObserverErrorsOpts,
      }

      const result = originalFactory(opts)
      return definition.type === 'atom'
        ? wrapAtom({ id: definition.id, atom: result as Atom<unknown>, ...wrapOpts })
        : mapValues(result as Record<string, Atom<unknown>>, (atom, id) => {
            return wrapAtom({ id: `${definition.id}.${id}`, atom, ...wrapOpts })
          })
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
