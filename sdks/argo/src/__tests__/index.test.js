import preprocessActual from '@exodus/dependency-preprocessors'

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
    alias: jest.fn(),
    config: jest.fn(),
    debuggerPreprocessor: jest.fn(),
    devModeAtoms: jest.fn(),
    logify: jest.fn(),
    namespaceStorage: jest.fn(),
    namespacedErrorTracking: jest.fn(),
    optional: jest.fn(),
    performanceMonitor: jest.fn(),
    readOnlyAtoms: jest.fn(),
    atomsIdentification: jest.fn(),
  }
})

await import('./index.body.js')
