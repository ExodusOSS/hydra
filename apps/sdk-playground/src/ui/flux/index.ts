import { composeWithDevTools as compose } from 'redux-devtools-extension/developmentOnly'
import DevTools from '../components/dev-tools/index.js'
import createReduxIOC from '@exodus/headless/redux'
import createDependencies from './dependencies.js'

const enhancer = compose(DevTools.instrument())
const dependencies = createDependencies()

const reduxIoc = createReduxIOC({
  actionCreators: {},
  reducers: {},
  enhancer: enhancer as any, // FIX: Adjust enhancer type on Argo redux
})

dependencies.forEach((dependency) => {
  reduxIoc.use(dependency)
})

const { selectors, handleEvent, store } = reduxIoc.resolve()

export { selectors, handleEvent, store }
