import { renderHook } from '@testing-library/react-hooks'
import useMemoCompare from '../useMemoCompare.js'
import crypto from 'node:crypto'

describe('useMemoCompare', () => {
  const setup = ({ getDependencies, compareFcts }) => {
    let recomputed = 0

    return renderHook(() => useMemoCompare(() => recomputed++, getDependencies(), compareFcts))
  }

  it('should recompute memo only once if deps unchanged', async () => {
    const { result, rerender } = setup({ getDependencies: () => [{ id: 1 }] })

    expect(result.current).toBe(0)
    rerender()
    expect(result.current).toBe(0)
  })

  it('should recompute memo if deps keep changing', async () => {
    const { result, rerender } = setup({
      getDependencies: () => [{ id: 1, name: crypto.randomUUID() }],
    })

    expect(result.current).toBe(0)
    rerender()
    expect(result.current).toBe(1)
  })

  it('should not recompute if custom compare fct returns true', async () => {
    const isEqual = (prev, next) => prev.id === next.id

    const { result, rerender } = setup({
      getDependencies: () => [{ id: 1, name: crypto.randomUUID() }],
      compareFcts: [isEqual],
    })

    expect(result.current).toBe(0)
    rerender()
    expect(result.current).toBe(0)
  })

  it.each([[true], [false]])(
    'should default to isEqual if custom compare fct only specified for some deps (%s)',
    async (changesBetweenRenders) => {
      const customIsEqual = (prev, next) => prev.id === next.id

      const { result, rerender } = setup({
        getDependencies: () => [
          { id: 1, name: crypto.randomUUID() },
          { id: 42, ...(changesBetweenRenders && { name: crypto.randomUUID() }) },
        ],
        compareFcts: [customIsEqual],
      })

      expect(result.current).toBe(0)

      rerender()
      rerender()
      rerender()

      expect(result.current).toBe(changesBetweenRenders ? 3 : 0)
    }
  )
})
