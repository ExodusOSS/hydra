import { createInMemoryAtom } from '@exodus/atoms'
import { APP_PROCESS_INITIAL_STATE } from '../constants'

const createAppProcessAtom = () => {
  return createInMemoryAtom({
    defaultValue: APP_PROCESS_INITIAL_STATE,
  })
}

export default createAppProcessAtom
