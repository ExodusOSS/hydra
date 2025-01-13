import { assertMatchingDomain } from './validators'

describe('validators', () => {
  describe('assertMatchingDomain', () => {
    function fail(reason: string): string {
      throw new Error(reason)
    }

    it('should not throw for unset domain', () => {
      assertMatchingDomain(undefined, 'example.com')
    })

    it('should not throw for origin domain', () => {
      assertMatchingDomain('example.com', 'example.com')
    })

    it('should not throw for parent domain', () => {
      assertMatchingDomain('example.com', 'sub.example.com')
    })

    it('should throw for third party origin domain', () => {
      try {
        assertMatchingDomain('totes-different.com', 'example.com')
        fail('should have thrown but did not')
      } catch (e) {
        expect((e as Error).message).toContain('Cannot set a cookie for a third party origin')
      }
    })

    it('should throw for sub domain', () => {
      try {
        assertMatchingDomain('sub.example.com', 'example.com')
        fail('should have thrown but did not')
      } catch (e) {
        expect((e as Error).message).toContain('Cannot set a cookie for a subdomain')
      }
    })
  })
})
