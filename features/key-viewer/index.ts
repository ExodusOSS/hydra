import keyViewerDefinition from './module/index.js'
import keyViewerApiDefinition from './api/index.js'

const keyViewer = () => ({
  id: 'keyViewer',
  definitions: [
    {
      definition: keyViewerDefinition,
    },
    { definition: keyViewerApiDefinition },
  ],
})

export default keyViewer
