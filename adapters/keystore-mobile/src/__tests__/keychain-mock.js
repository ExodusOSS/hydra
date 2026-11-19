import { mapValues } from '@exodus/basic-utils'

import createKeychainMockNoJest from './keychain-mock-no-jest.js'

export const mockKeychain = createKeychainMock()

export default function createKeychainMock() {
  return mapValues(createKeychainMockNoJest(), (value) =>
    typeof value === 'function' ? jest.fn(value) : value
  )
}
