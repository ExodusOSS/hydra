// @flow
import delay from 'delay'
import dayjs from 'dayjs'

const delayWithJitter = (ms, jitter = 0) => delay(Math.floor(ms + Math.random() * jitter))

const fetchPricesInterval = async ({
  func,
  abortController,
  granularity,
  getJitter = () => 0,
  delay = 0,
  getCurrentTime = () => Date.now(),
}: {
  func: Function,
  abortController: AbortController,
  granularity: 'hour' | 'day',
  getJitter: Function,
  delay: number,
  getCurrentTime: () => number,
}) => {
  while (abortController ? !abortController.signal.aborted : true) {
    try {
      await func()
    } catch (err) {
      console.error(err)
    }

    const now = getCurrentTime()
    const untilEndOfPeriod =
      dayjs
        .utc(now)
        .endOf(granularity)
        .valueOf() - now

    await delayWithJitter(untilEndOfPeriod + delay, getJitter())
  }
}

export default fetchPricesInterval
