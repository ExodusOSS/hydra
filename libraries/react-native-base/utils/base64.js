import { rnDelay } from './delay'

export const decodeAsync = async (input, chunkSize = 32_768) => {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a base64 string')
  }

  const stringLength = input.length
  const outputBuffers = []
  let currentIndex = 0

  while (currentIndex < stringLength) {
    // don't block the main thread
    await rnDelay(0)
    const chunk = input.slice(currentIndex, currentIndex + chunkSize)
    outputBuffers.push(Buffer.from(chunk, 'base64'))
    currentIndex += chunkSize
  }

  await rnDelay(0)

  return Buffer.concat(outputBuffers)
}
