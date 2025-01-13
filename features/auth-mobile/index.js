import authDefinition from './module'
import { authAtomDefinition } from './atoms'
import authApiDefinition from './api'
import authPluginDefinition from './plugin'
import bioAuthDefinition from './module/bio/bio-auth'
import biometryDefinition from './module/bio/biometry'

const auth = () => ({
  id: 'auth',
  definitions: [
    { definition: authDefinition },
    { definition: authAtomDefinition },
    { definition: authApiDefinition },
    { definition: authPluginDefinition },
    { definition: bioAuthDefinition },
    { definition: biometryDefinition },
  ],
})

export default auth
