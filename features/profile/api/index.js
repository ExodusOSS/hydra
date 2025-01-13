const createProfileApi = ({ fusionProfileAtom }) => {
  return {
    profile: {
      get: async () => fusionProfileAtom.get(),
      set: async (value) => fusionProfileAtom.set(value),
    },
  }
}

const profileApiDefinition = {
  id: 'profileApi',
  type: 'api',
  factory: createProfileApi,
  dependencies: ['fusionProfileAtom'],
}

export default profileApiDefinition
