import * as android from './android'
import * as ios from './ios'
import { OperatingSystem } from '../../shared/types'

const platformCode = {
  [OperatingSystem.Android]: android,
  [OperatingSystem.iOS]: ios,
}

export default platformCode
