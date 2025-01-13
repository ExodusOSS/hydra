export const rejectAfter = (ms, reason) => {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      reject(new Error(reason))
    }, ms)
  )
}
