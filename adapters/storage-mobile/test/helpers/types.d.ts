import type { Filesystem } from '../../src/helpers/types.js'

export type TestFilesystem = Filesystem & {
  readonly _data: Record<string, string>
}
