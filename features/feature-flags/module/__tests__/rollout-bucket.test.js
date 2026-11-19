import { createHash } from 'node:crypto'

import getRolloutBucket from '../rollout-bucket.js'

const userIds = Array.from({ length: 20_000 }, (_, i) =>
  createHash('sha256').update(`user-${i}`).digest('base64')
)
const share = (predicate) => userIds.filter(predicate).length / userIds.length

describe('getRolloutBucket', () => {
  it('keeps existing users in the same bucket across releases', () => {
    const userId = 'cHiR1siXoRdEbFjbS+sFPgr+Hut27Co8LsUpJNdNMAY='

    expect(getRolloutBucket({ name: 'dogeMode', userId })).toBe(29)
    expect(getRolloutBucket({ name: 'catMode', userId })).toBe(5)
  })

  it('opts in the rollout share of users', () => {
    for (const rollout of [1, 10, 50]) {
      const actual = share((userId) => getRolloutBucket({ name: 'dogeMode', userId }) < rollout)
      expect(Math.abs(actual - rollout / 100)).toBeLessThan(0.01)
    }
  })

  it('picks a different cohort for each flag', () => {
    const inBoth = share(
      (userId) =>
        getRolloutBucket({ name: 'dogeMode', userId }) < 10 &&
        getRolloutBucket({ name: 'catMode', userId }) < 10
    )

    expect(Math.abs(inBoth - 0.01)).toBeLessThan(0.005)
  })
})
