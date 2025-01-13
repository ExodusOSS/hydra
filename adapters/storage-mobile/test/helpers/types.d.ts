import { Filesystem } from '../../src/helpers/types'

export type TestFilesystem = Filesystem & {
  readonly _data: Record<string, string>
}
