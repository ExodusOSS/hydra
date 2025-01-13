const deprecationWarning = (message) => {
  try {
    // try/catch might be excessive, but I don't know if any of this would throw on rn vs electron
    console.warn('***************************************************************')
    console.warn(message)
    console.warn('***************************************************************')
    console.trace()
  } catch (err) {}
}

export const maybeReportDifferentTypesDeprecated = (num, otherNum, operation) => {
  if (!num.unitType.equals(otherNum.unitType))
    deprecationWarning(
      `DEPRECATION WARNING: number-unit.${operation} on different NumberUnit types (${num}, ${otherNum}) is not correct and will be removed soon`
    )
}

export default deprecationWarning
