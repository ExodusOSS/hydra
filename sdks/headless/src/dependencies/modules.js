import unlockEncryptedStorageDefinition from '../unlock-encrypted-storage'
import { withType } from './utils'

const createModuleDependencies = () =>
  [{ definition: unlockEncryptedStorageDefinition }].map(withType('module'))

export default createModuleDependencies
