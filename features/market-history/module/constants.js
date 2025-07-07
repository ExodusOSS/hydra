const HOURLY_LIMIT = 24 * 7
const DAILY_LIMIT = 3000
const MINUTE_LIMIT = 60 * 2 // we have only 2 hours of minute level data cached

export const LIMIT = {
  minute: MINUTE_LIMIT,
  hour: HOURLY_LIMIT,
  day: DAILY_LIMIT,
}
export const START_TIME = new Date('2015-12-09').getTime()
