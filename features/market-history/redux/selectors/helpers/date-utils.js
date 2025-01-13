export function cloneDate(date) {
  return new Date(date.getTime())
}

export function startOfHour(date) {
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

export function startOfDay(date) {
  const cd = cloneDate(date)
  cd.setUTCHours(0, 0, 0, 0)
  return cd
}

export const prepareTime = (date, type) => {
  let preparedTime
  switch (type) {
    case 'daily': {
      preparedTime = startOfDay(date)
      break
    }

    case 'hourly': {
      preparedTime = startOfHour(date)
      break
    }
  }

  return preparedTime.valueOf()
}
