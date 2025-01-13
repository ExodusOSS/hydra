import { describe, test } from 'node:test'
import { expect } from 'expect'

import suite from '@exodus/storage-spec'
import createStorage from '../src/index.js'

suite({ factory: createStorage, describe, test, expect })
