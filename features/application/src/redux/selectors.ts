import { MY_STATE } from '@exodus/redux-dependency-injection'
import type { State } from './types.js'

const isLoadingSelectorDefinition = {
  id: 'isLoading',
  resultFunction: (assetsLoaded: boolean, { isLoading }: State) => !assetsLoaded || isLoading,
  dependencies: [{ module: 'assets', selector: 'loaded' }, { selector: MY_STATE }],
} as const

export default [isLoadingSelectorDefinition]
