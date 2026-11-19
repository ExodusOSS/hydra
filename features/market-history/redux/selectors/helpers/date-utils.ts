import type { PriceTimeType } from '../../../types.js'

export function cloneDate(date: Date): Date {
  return new Date(date.getTime())
}

export function startOfHour(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      0,
      0,
      0
    )
  )
}

export function startOfDay(date: Date): Date {
  const cd = cloneDate(date)
  cd.setUTCHours(0, 0, 0, 0)
  return cd
}

export function startOfMinute(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      0,
      0
    )
  )
}

export const prepareTime = (date: Date, type: PriceTimeType): number => {
  let preparedTime: Date
  switch (type) {
    case 'daily': {
      preparedTime = startOfDay(date)
      break
    }

    case 'hourly': {
      preparedTime = startOfHour(date)
      break
    }

    case 'minutely': {
      preparedTime = startOfMinute(date)
      break
    }
  }

  return preparedTime.valueOf()
}
