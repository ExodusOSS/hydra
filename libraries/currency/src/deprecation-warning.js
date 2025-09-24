const throwOnDifferentType =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

const deprecationWarning = (message) => {
  try {
    // try/catch might be excessive, but I don't know if any of this would throw on rn vs electron
    console.warn('***************************************************************')
    console.warn(message)
    console.warn('***************************************************************')
    console.trace()
  } catch {}
}

export const maybeReportDifferentTypesDeprecated = (num, otherNum, operation) => {
  if (throwOnDifferentType && !num.unitType.equals(otherNum.unitType)) {
    throw new Error(
      `number-unit.${operation} on different NumberUnit types (${num}, ${otherNum}) is not correct and will be removed soon.`
    )
  }
}

export default deprecationWarning
