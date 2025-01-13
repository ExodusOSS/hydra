const createGeolocationDebugApi = ({ geolocationAtom }) => {
  return {
    geolocation: {
      merge: async (value) => {
        const data = await geolocationAtom.get()
        await geolocationAtom.set({ ...data, ...value })
      },
    },
  }
}

const geolocationDebugDefinition = {
  id: 'geolocationDebug',
  type: 'debug',
  factory: createGeolocationDebugApi,
  dependencies: ['geolocationAtom'],
  public: true,
}

export default geolocationDebugDefinition
