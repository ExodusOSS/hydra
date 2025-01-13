const { getArgumentValue } = require('../../utils/process')
describe('process', () => {
  describe('getArgumentValue', () => {
    beforeAll(() => {
      process.argv = ['--ollivanders', '--spell', 'lumos,wingardium-leviosa', '--other-flag']
    })

    it('should return value of an argument', () => {
      expect(getArgumentValue('--spell')).toEqual('lumos,wingardium-leviosa')
    })

    it('should return true for argument without value', () => {
      expect(getArgumentValue('--ollivanders')).toBe(true)
      expect(getArgumentValue('--other-flag')).toBe(true)
    })

    it('should return undefined if not present', () => {
      expect(getArgumentValue('--potters-wand')).toEqual(undefined)
    })
  })
})
