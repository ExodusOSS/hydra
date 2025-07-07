import type apiDefinition from './api/index.js'

declare const marketHistory: () => {
  id: 'marketHistory'
  definitions: [{ definition: typeof apiDefinition }]
}

export default marketHistory
