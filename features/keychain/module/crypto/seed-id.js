import { getSeedId } from '@exodus/bip32'

export const getUniqueSeedIds = async (seeds) => {
  const seedIds = await Promise.all(seeds.map(getSeedId))
  return [...new Set(seedIds)]
}

export { getSeedId } from '@exodus/bip32'
