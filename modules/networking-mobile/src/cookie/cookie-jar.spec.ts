import { testsuite } from '@exodus/networking-spec/cookie'
import { CookieJar } from './index'
import { OperatingSystem } from '../shared/types'

testsuite(() => new CookieJar(OperatingSystem.iOS))
