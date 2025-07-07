export const rejectAfter = (ms, reason) => {
  let timeout
  const promise = new Promise((_resolve, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(reason))
    }, ms)
  })

  return { promise, clear: () => clearTimeout(timeout) }
}
