import { parse } from '@exodus/pofile'
import { existsSync, readFileSync, writeFileSync } from 'fs'

const fileManager = {
  read: (path) => {
    if (!existsSync(path)) {
      throw new Error(`File doesn't exist: ${path}`)
    }

    return parse(readFileSync(path, 'utf-8'))
  },
  write: (path, poFile) => {
    return writeFileSync(path, poFile.toString() + '\n')
  },
}

export default fileManager
