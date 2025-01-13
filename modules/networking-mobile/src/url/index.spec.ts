import { testsuite } from '@exodus/networking-spec/url'
import { URLParser } from './index'

testsuite(() => new URLParser(), { unicode: false })
