import { hashSync } from '@exodus/crypto/hash'

const getRolloutBucket = ({ name, userId }) =>
  Number.parseInt(hashSync('sha256', `${name}:${userId}`, 'hex').slice(0, 8), 16) % 100

export default getRolloutBucket
