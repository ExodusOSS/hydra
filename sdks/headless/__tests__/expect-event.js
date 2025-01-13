const expectEvent = ({ port, event, payload, predicate }) =>
  new Promise((resolve, reject) => {
    const unsubscribe = () => port.unsubscribe(listener)
    const listener = (e) => {
      if (e.type !== event) return

      if (payload) {
        expect(e.payload).toEqual(payload)
      }

      if (predicate) {
        try {
          if (predicate(e.payload)) {
            unsubscribe()
            resolve(e.payload)
          }
        } catch (error) {
          reject(error)
        }
      } else {
        unsubscribe()
        resolve(e.payload)
      }
    }

    port.subscribe(listener)
  })

export default expectEvent
