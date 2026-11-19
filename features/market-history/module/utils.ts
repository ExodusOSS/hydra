import ms from 'ms'

export const timeToDays = (time: number): number => time / ms('1d')
export const timeToHours = (time: number): number => time / ms('1h')
export const timeToMinutes = (time: number): number => time / ms('1m')
