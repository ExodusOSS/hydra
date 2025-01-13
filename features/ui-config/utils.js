import { toUpperSnakeCase } from '@exodus/formatting'

export const getAtomId = (id) => `${id}ConfigAtom`

const toReduxEvent = (type) => `EVENT_${toUpperSnakeCase(type.replace(/configatom$/i, ''))}_CONFIG`
const getConfigReduxEventName = (id) => toReduxEvent(getAtomId(id))

export const getEventReduxMap = (config) =>
  Object.fromEntries(
    Object.values(config).map(({ id }) => [getAtomId(id), getConfigReduxEventName(id)])
  )

export const getConfigReduxEvents = (config) =>
  new Map(Object.values(config).map(({ id }) => [getConfigReduxEventName(id), id]))
