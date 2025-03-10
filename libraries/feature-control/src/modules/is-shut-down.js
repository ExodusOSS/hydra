import semver from 'semver'

const isShutDown = (featureConfig, { versionSemver }) => {
  const shutdownSemver = featureConfig?.shutdownSemver
  return Boolean(shutdownSemver && semver.satisfies(versionSemver, shutdownSemver))
}

export default isShutDown
