import { getPositionalArguments } from '../../utils/process.js'

describe('getPositionalArguments', () => {
  it('should return positional arguments', () => {
    process.argv = [
      '$NODE_PATH',
      '$SCRIPT_PATH',
      './lib',
      './potter',
      '--cannot-cast-lumos',
      '--babel-config',
      './babel-config.js',
      'other-positional-arg',
    ]
    expect(getPositionalArguments()).toEqual(['./lib', './potter', 'other-positional-arg'])
  })

  it('should return empty array when no positional args supplied', () => {
    process.argv = [
      '$NODE_PATH',
      '$SCRIPT_PATH',
      '--cannot-cast-lumos',
      '--babel-config',
      './babel-config.js',
    ]
    expect(getPositionalArguments()).toEqual([])
  })
})
