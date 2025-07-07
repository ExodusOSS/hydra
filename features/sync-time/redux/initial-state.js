import { SynchronizedTime } from '@exodus/basic-utils'

const initialState = {
  time: SynchronizedTime.now(),
  startOfHour: new Date(SynchronizedTime.now()).setMinutes(0, 0, 0).valueOf(),
  startOfMinute: new Date(SynchronizedTime.now()).setSeconds(0, 0).valueOf(),
}

export default initialState
