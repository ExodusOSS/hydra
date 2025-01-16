import createInMemoryStorage from '@exodus/storage-memory'

import createStorage from '../unsafe-storage'

const createSessionStorage = ({ store } = {}) => {
  let sessionStorage

  try {
    sessionStorage = createStorage({ store })
  } catch (e) {
    console.warn(`session storage: failed to create. fallback to memory storage`, e)
    sessionStorage = createInMemoryStorage({ skipValueValidation: true })
  }

  return sessionStorage
}

export default createSessionStorage
