import lodash from 'lodash'
import { enforceObservableRules } from '@exodus/atoms'

const { get: getValueAtPath, isEqual } = lodash
// lodash uses Object prototype for set, while basic-utils uses null prototype, which trips up fusion-merge
// eslint-disable-next-line @exodus/restricted-imports/prefer-basic-utils
const { set: setValueAtPath } = lodash

export const createFusionAtom = ({ fusion, logger, online, path, defaultValue }) => {
  let prevValue
  const set = async (value) => {
    await fusion.mergeProfile(setValueAtPath({}, path, value))
  }

  const get = async () => {
    const profile = await fusion.getProfile({ online })
    const currentValue = getValueAtPath(profile, path)
    if (isEqual(currentValue, prevValue)) {
      return prevValue
    }

    prevValue = currentValue
    return currentValue
  }

  const observe = (listener) => {
    let prevValue
    let subscribed = true
    let called = false

    const wrapper = (profile) => {
      if (subscribed) {
        const value = getValueAtPath(profile, path)
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

  return enforceObservableRules({
    get,
    set,
    observe,
    defaultValue,
    logger,
  })
}
