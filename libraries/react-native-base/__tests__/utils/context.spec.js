const fakeRoot = '/Users/bruce-wayne/workspace/exodus-mobile'

const Module = require('module')
const { _resolveFilename } = Module
const unmocked = new Set()
Module._resolveFilename = function fakeResolve(request, parent) {
  let redirected

  if (!unmocked.has(request)) {
    if (request.startsWith(`${fakeRoot}/node_modules/`)) {
      redirected = request.replace(`${fakeRoot}/node_modules/`, '')
    } else if (request.startsWith(`${fakeRoot}/src/node_modules/`)) {
      redirected = request.replace(`${fakeRoot}/src/node_modules/`, '')
    }

    // Redirect packages we don't have to something we have so we can mock that
    if (redirected === 'react-native-code-push/package.json') redirected = 'lodash/package.json'
    if (redirected === 'jest/package.json') redirected = 'glob/package.json'
  }

  return _resolveFilename(redirected ?? request, parent)
}

const mock = (dep, exports) => {
  unmocked.delete(dep)
  const file = require.resolve(dep)
  require.cache[file] = { id: file, file, exports, loaded: true }
}

const unmock = (dep) => {
  const file = require.resolve(dep)
  delete require.cache[file]
  unmocked.add(dep)
}

describe('context', () => {
  beforeEach(() => {
    jest.resetModules()
    mock(`${fakeRoot}/src/node_modules/react-native/package.json`, { version: '0.42.0' })
    mock(`${fakeRoot}/src/node_modules/react-native-code-push/package.json`, { version: '0.73.0' })
    mock(`${fakeRoot}/src/node_modules/@react-navigation/core/package.json`, { version: '1.2.3' })
    mock(`${fakeRoot}/src/node_modules/react-native-get-random-values/package.json`, {
      version: '1.2.0',
    })
    mock(`${fakeRoot}/node_modules/jest/package.json`, { version: '9.2.3' })
  })

  it('should derive correct paths and versions when cwd is src', () => {
    jest.spyOn(process, 'cwd').mockReturnValue(`/Users/bruce-wayne/workspace/exodus-mobile/src`)

    const context = require('../../utils/context')
    expect(context).toEqual(
      createExpectedContext({
        relativeRootNodeModules: '../node_modules',
        relativeProdNodeModules: 'node_modules',
        relativeRoot: '..',
        relativeProd: './',
      })
    )
  })

  it('should derive correct paths and versions when cwd is /', () => {
    jest.spyOn(process, 'cwd').mockReturnValue(`/Users/bruce-wayne/workspace/exodus-mobile`)
    const context = require('../../utils/context')

    expect(context).toEqual(
      createExpectedContext({
        relativeRootNodeModules: 'node_modules',
        relativeProdNodeModules: 'src/node_modules',
        relativeRoot: './',
        relativeProd: 'src',
      })
    )
  })

  it('should not fail if root modules not present yet', () => {
    unmock(`${fakeRoot}/node_modules/jest/package.json`)
    const context = require('../../utils/context')
    expect(context.jestVersion).toBeUndefined()
  })
})

const createExpectedContext = ({
  relativeRoot,
  relativeProd,
  relativeRootNodeModules,
  relativeProdNodeModules,
}) => ({
  reactNativeVersion: '0.42.0',
  reactNavigationCoreVersion: '1.2.3',
  rnGetRandomValuesVersion: '1.2.0',
  jestVersion: '9.2.3',
  directories: {
    root: {
      absolute: '/Users/bruce-wayne/workspace/exodus-mobile',
      relative: relativeRoot,
    },
    prod: {
      absolute: '/Users/bruce-wayne/workspace/exodus-mobile/src',
      relative: relativeProd,
    },
    nodeModules: {
      root: {
        absolute: '/Users/bruce-wayne/workspace/exodus-mobile/node_modules',
        relative: relativeRootNodeModules,
      },
      prod: {
        absolute: '/Users/bruce-wayne/workspace/exodus-mobile/src/node_modules',
        relative: relativeProdNodeModules,
      },
    },
  },
})
