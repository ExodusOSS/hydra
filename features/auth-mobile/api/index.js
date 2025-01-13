const authApiDefinition = {
  id: 'authApi',
  type: 'api',
  factory: ({ auth, authAtom, bioAuth, biometry }) => ({
    auth: {
      ...auth,
      async reload() {
        await auth.load()
      },
      bio: bioAuth,
      get: authAtom.get,
    },
  }),
  dependencies: ['auth', 'bioAuth', 'authAtom', 'biometry'],
}

export default authApiDefinition
