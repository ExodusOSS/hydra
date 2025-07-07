import ms from 'ms'

export const timeToDays = (time) => time / ms('1d')
export const timeToHours = (time) => time / ms('1h')
export const timeToMinutes = (time) => time / ms('1m')
