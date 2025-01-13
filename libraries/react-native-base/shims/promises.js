export function allSettled(promises) {
  return Promise.all(
    [...promises].map((promise) => {
      try {
        return Promise.resolve(promise).then(
          (value) => ({
            status: 'fulfilled',
            value,
          }),
          (error) => ({
            status: 'rejected',
            reason: error,
          })
        )
      } catch (error) {
        return Promise.reject(error)
      }
    })
  )
}
