const isInRollout = (featureConfig, { rolloutBucket }) => {
  const rollout = featureConfig?.rollout
  if (rollout == null) return true
  // default to not allowing in case there is a mis-configuration
  if (!Number.isInteger(rollout) || rollout < 0 || rollout > 100) return false
  if (rollout === 100) return true

  return typeof rolloutBucket === 'number' && rolloutBucket < rollout
}

export default isInRollout
