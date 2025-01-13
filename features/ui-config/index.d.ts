import type uiConfigApiDefinition from './api/index.js'

type Config = { config: Record<string, any> }

declare const uiConfig: (config: Config) => {
  id: 'uiConfig'
  definitions: [{ definition: typeof uiConfigApiDefinition }]
}

export default uiConfig
