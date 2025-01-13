const { resolve: mockResolve, parse: mockParse } = require('path')

const { createValidatorDeclaration: mockCreateValidatorDeclaration } = require('./index')

jest.mock('path', () => ({
  resolve: jest.fn(),
  parse: jest.fn(),
}))

jest.mock('./index.js', () => ({
  createValidatorDeclaration: jest.fn(),
}))

const { attemptToCompile } = jest.requireActual('./index.js')

describe('attemptToCompile', () => {
  const babelPath = {
    replaceWithMultiple: jest.fn(),
    node: { specifiers: { map: jest.fn() } },
  }
  const fileName = 'babel.index.js'
  const parsedValue = { dir: 'dir' }
  const moduleName = 'module.schemasafe.json'
  const resolvedPath = '/Users/dev/projects/projectName/src/module.schemasafe.json'

  beforeAll(() => {
    mockResolve.mockImplementation(() => resolvedPath)
    mockParse.mockImplementation(() => parsedValue)
    babelPath.node.specifiers.map.mockImplementation(() => mockCreateValidatorDeclaration())
  })

  it('does nothing if the module does not match the globs', () => {
    attemptToCompile({ globs: ['**/*.schema.json'] }, { moduleName, babelPath })

    expect(babelPath.node.specifiers.map).not.toHaveBeenCalled()
  })

  it('compiles the module if the globs match', () => {
    attemptToCompile({ globs: ['**/*.schemasafe.json'] }, { fileName, moduleName, babelPath })

    expect(mockParse).toHaveBeenCalledWith(fileName)
    expect(mockResolve).toHaveBeenCalledWith(parsedValue.dir, moduleName)
    expect(babelPath.node.specifiers.map).toHaveBeenCalled()
    expect(mockCreateValidatorDeclaration).toHaveBeenCalled()
    expect(babelPath.replaceWithMultiple).toHaveBeenCalled()
  })
})
