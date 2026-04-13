import keychainDefinition from '../index.js'

const createKeychain = async ({ seed, ...rest }) => {
  const instance = keychainDefinition.factory(rest)
  await instance.addSeed(seed)

  return instance
}

export default createKeychain
