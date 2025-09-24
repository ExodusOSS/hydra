import './styles/globals.css'
import './styles/cmdk.css'

import { Provider as HeadlessProvider } from '@exodus/headless-ui'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import adapters from '@/background/adapters'

import Root from './root.js'
import exodus from './exodus.js'
import initialize from './initialize.js'
import { store } from './flux/index.js'
import selectors from './flux/selectors.js'

void initialize(exodus)

const uiAdapters = {
  storage: adapters.unsafeStorage,
}

const Main = () => {
  return (
    <Provider store={store}>
      <HeadlessProvider exodus={exodus} adapters={uiAdapters} selectors={selectors}>
        <Root />
      </HeadlessProvider>
    </Provider>
  )
}

createRoot(document.querySelector('#root')!).render(<Main />)

globalThis.exodus = exodus
globalThis.selectors = selectors
globalThis.store = store

Object.defineProperty(globalThis, 'state', {
  get: () => store.getState(),
})
