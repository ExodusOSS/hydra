import { TestFilesystem } from './types'

export default function createInMemoryFS(): TestFilesystem {
  const data: Record<string, string> = {}

  const readFile: (key: string) => Promise<string> = async (key: string) => {
    const value = data[key]

    if (!value) {
      throw new Error('not found')
    }

    return value
  }

  const writeFile = async (key: string, value: string) => {
    data[key] = value
  }

  return {
    get _data() {
      return data
    },
    mkdirp: jest.fn(() => Promise.resolve()),
    readUtf8: readFile,
    writeUtf8: writeFile,
    rimraf: async (path: string) => {
      for (const key in data) {
        if (key.startsWith(path)) {
          delete data[key]
        }
      }
    },
  }
}
