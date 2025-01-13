const sanitizeErrorMessage = (message: string) =>
  message
    // 12 word phrase
    .replaceAll(/(?:[A-Za-z]{3,20}\s+){11}[A-Za-z]{3,20}/g, '****')
    // hex
    .replaceAll(/(?:0x)?[\dA-Fa-f]{20,}/g, '****')
    // base58
    // https://stackoverflow.com/a/33060399
    .replaceAll(/[1-9A-HJ-NP-Za-km-z]{50,}/g, '****')
    // base64
    // adapted from https://stackoverflow.com/a/5885097
    // added `{3,}` to match at least 12 characters
    .replaceAll(
      /(?:[\d+/A-Za-z]{4}){3,}(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=|[\d+/A-Za-z]{4})/g,
      '****'
    )

export default sanitizeErrorMessage
