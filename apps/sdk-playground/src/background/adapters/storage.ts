import BJSON from 'buffer-json'
import createLocalStorage from '@exodus/storage-local-storage'
import transformStorage from '@exodus/transform-storage'

export default function createStorage() {
  const storage = createLocalStorage({ localStorage: window.localStorage })
  return transformStorage({
    storage,
    onRead: async (str) => (str === undefined ? str : BJSON.parse(str as string)),
    onWrite: (value) => BJSON.stringify(value),
  })
}
