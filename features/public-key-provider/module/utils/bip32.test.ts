import { derivationPathsWithHardenedPrefix } from './bip32.js'

describe('derivationPathsUpToFirstHardenedIndex', () => {
  test.each([
    {
      path: "m/49'/0'/0'/0/1",
      expected: [
        {
          derivationPath: "m/49'/0'/0'/0",
          removedIndices: ['1'],
        },
        {
          derivationPath: "m/49'/0'/0'",
          removedIndices: ['0', '1'],
        },
      ],
    },
    {
      path: "m/49'/0'/0'/0/1/2/3",
      expected: [
        {
          derivationPath: "m/49'/0'/0'/0/1/2",
          removedIndices: ['3'],
        },
        {
          derivationPath: "m/49'/0'/0'/0/1",
          removedIndices: ['2', '3'],
        },
        {
          derivationPath: "m/49'/0'/0'/0",
          removedIndices: ['1', '2', '3'],
        },
        {
          derivationPath: "m/49'/0'/0'",
          removedIndices: ['0', '1', '2', '3'],
        },
      ],
    },
    {
      path: 'm/49/1/2',
      expected: [
        {
          derivationPath: 'm/49/1',
          removedIndices: ['2'],
        },
        {
          derivationPath: 'm/49',
          removedIndices: ['1', '2'],
        },
        {
          derivationPath: 'm',
          removedIndices: ['49', '1', '2'],
        },
      ],
    },
    {
      path: 'm',
      expected: [],
    },
  ])('produces derivation paths for $path', ({ path, expected }) => {
    const paths: { derivationPath: string; removedIndices: string[] }[] = []
    for (const derivationPath of derivationPathsWithHardenedPrefix(path)) {
      paths.push(derivationPath)
    }

    expect(paths).toEqual(expected)
  })
})
