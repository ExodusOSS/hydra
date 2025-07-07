import unlockEncryptedStorageDefinition from '../unlock-encrypted-storage.js'
import { withType } from './utils.js'

const createModuleDependencies = () =>
  [{ definition: unlockEncryptedStorageDefinition }].map(withType('module'))

export default createModuleDependencies
