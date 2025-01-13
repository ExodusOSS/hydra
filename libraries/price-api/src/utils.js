// @flow
import ms from 'ms'

export const timeToDays = (time: number) => time / ms('1d')
export const timeToHours = (time: number) => time / ms('1h')
