function cleanInput(value, decimals = null) {
  // Remove spaces
  value = value.trim()

  // Allow numbers, `.` and `,` only (Android)
  value =
    value.includes(',') && value.includes('.')
      ? value.replace(/[^\d.]/gu, '')
      : value.replace(/[^\d,.]/gu, '')

  // Support `,` for some locales
  value = value.replace(/,+/gu, '.')

  // Drop extra zeros on the left at start
  if (value === '00') value = '0'

  // Support starting with `.`
  if (value === '.') value = '0.'

  // Clean more than one dot
  value = value.split('.').slice(0, 2).join('.')

  // NOTE: this permits non-numeric characters because it feels like better UX if you press a button, it displays
  // the keyboard should protect against bad UX here with people typing characters
  // we can adjust if needed.

  // Drops chars exceeding decimals
  // Test with !== null as decimals can be 0
  if (decimals !== null && value.includes('.')) {
    let [first, last] = value.split('.')
    if (decimals === 0) return first
    last = last.slice(0, decimals)
    value = [first, last].join('.')
  }

  return value
}

export default cleanInput
