import { mapValues } from '@exodus/basic-utils'

class Keychain {
  #data = {}

  getInternetCredentials = async (key) => {
    return key in this.#data ? { password: this.#data[key] } : false
  }

  setInternetCredentials = async (key, unused, val) => {
    this.#data[key] = val
  }

  resetInternetCredentials = async (key) => {
    delete this.#data[key]
  }

  _clear = () => {
    this.#data = {}
  }

  SECURITY_LEVEL = {
    SECURE_SOFTWARE: 1,
  }

  ACCESSIBLE = {
    WHEN_UNLOCKED: 2,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 3,
  }
}

export const mockKeychain = createKeychainMock()

export default function createKeychainMock() {
  return mapValues(new Keychain(), (value) =>
    typeof value === 'function' ? jest.fn(value) : value
  )
}
