// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { enforceObservableRules } from '@exodus/atoms'

const { get: getValueAtPath, set: setValueAtPath, isEqual } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils
// lodash uses Object prototype for set, while basic-utils uses null prototype, which trips up fusion-merge

export const createFusionAtom = <T>({
  fusion,
  online,
  path,
  defaultValue,
}: CreateFusionAtomOptions<T>) => {
  let prevValue: T
  const set = async (value: T) => {
    await fusion.mergeProfile(setValueAtPath({}, path, value))
  }

  const get = async () => {
    const profile = await fusion.getProfile({ online })
    const currentValue = getValueAtPath(profile, path) as T
    if (isEqual(currentValue, prevValue)) {
      return prevValue
    }

    prevValue = currentValue
    return currentValue
  }

  const observe = (listener: (value: T) => void) => {
    let prevValue: T
    let subscribed = true
    let called = false

    const wrapper = (profile: object) => {
      if (subscribed) {
        const value = getValueAtPath(profile, path) as T
        if (called && isEqual(value, prevValue)) {
          return
        }

        prevValue = value
        called = true
        return listener(value)
      }
    }

    fusion.subscribe(wrapper)
    return () => {
      subscribed = false
    }
  }

  return enforceObservableRules<T>({
    get,
    set,
    observe,
    defaultValue,
  })
}

export interface Fusion {
  mergeProfile(profile: object): Promise<void>
  getProfile(options: { online?: boolean }): Promise<object>
  subscribe(callback: (profile: object) => void): void
}

export interface CreateFusionAtomOptions<T> {
  fusion: Fusion
  online?: boolean
  path: string
  defaultValue?: T
}
