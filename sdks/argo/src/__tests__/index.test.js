import preprocessActual from '@exodus/dependency-preprocessors'

// First, mock everything we need

jest.doMock('@exodus/dependency-injection', () => {
  const registerMultiple = jest.fn()
  const resolve = jest.fn()

  return {
    __esModule: true,
    default: () => ({ registerMultiple, resolve }),
  }
})

jest.doMock('@exodus/dependency-preprocessors', () => {
  const preprocess = jest.fn(preprocessActual)

  return {
    __esModule: true,
    default: preprocess,
  }
})

const fnM = () => ({ __esModule: true, default: jest.fn() })

jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/alias.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/config.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/debugger.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/dev-mode-atoms.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/logify.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/namespace-storage.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/namespaced-error-tracking.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/optional.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/performance-monitor.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/read-only-atoms.js', fnM)
jest.doMock('@exodus/dependency-preprocessors/src/preprocessors/atoms-identification.js', fnM)

// Now, load actual tests
await import('./index.body.js')
