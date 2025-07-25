import { withType } from './utils.js'

const createConfigDependencies = ({ config }) => {
  return [
    {
      definition: {
        id: 'config',
        factory: () => config,
        public: true,
      },
    },
  ].map(withType('config'))
}

export default createConfigDependencies
