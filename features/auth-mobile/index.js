import authDefinition from './module/index.js'
import authReportDefinition from './report/index.js'
import { authAtomDefinition } from './atoms/index.js'
import authApiDefinition from './api/index.js'
import authPluginDefinition from './plugin/index.js'
import bioAuthDefinition from './module/bio/bio-auth'
import biometryDefinition from './module/bio/biometry'

const auth = (config) => {
  return {
    id: 'auth',
    definitions: [
      { definition: authDefinition, config },
      { definition: authReportDefinition },
      { definition: authAtomDefinition },
      { definition: authApiDefinition },
      { definition: authPluginDefinition },
      { definition: bioAuthDefinition },
      { definition: biometryDefinition },
    ],
  }
}

export default auth
