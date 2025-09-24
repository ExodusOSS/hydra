import { cn } from '@/ui/components/xo/utils/cn'

describe('cn utility', () => {
  test('merges simple class names', () => {
    expect(cn('base', 'additional')).toBe('base additional')
  })

  test('handles conditional classes with clsx syntax', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  test('filters out falsy values', () => {
    expect(cn('base', undefined, null, false, '', 'final')).toBe('base final')
  })

  test('merges tailwind classes correctly with twMerge', () => {
    // twMerge resolves conflicts in Tailwind classes
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  test('handles arrays of classes', () => {
    expect(cn(['base', 'middle'], 'final')).toBe('base middle final')
  })

  test('handles complex nested structures', () => {
    expect(
      cn(
        'base',
        ['array-class-1', 'array-class-2'],
        { 'conditional-true': true, 'conditional-false': false },
        undefined,
        'final'
      )
    ).toBe('base array-class-1 array-class-2 conditional-true final')
  })

  test('returns empty string when no arguments', () => {
    expect(cn()).toBe('')
  })

  test('handles only falsy values', () => {
    expect(cn(undefined, null, false, '')).toBe('')
  })
})
