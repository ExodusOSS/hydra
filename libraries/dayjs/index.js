import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import utc from 'dayjs/plugin/utc.js'
import duration from 'dayjs/plugin/duration.js'

dayjs.extend(advancedFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)
dayjs.extend(duration)

// eslint-disable-next-line unicorn/prefer-export-from
export default dayjs
