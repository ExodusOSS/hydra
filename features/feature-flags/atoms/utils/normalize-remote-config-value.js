import semver from 'semver'

export default function normalizeRemoteConfigValue(remoteConfigValue) {
  if (remoteConfigValue == null) return remoteConfigValue
  if (typeof remoteConfigValue === 'boolean') return { enabled: remoteConfigValue }
  if (typeof remoteConfigValue !== 'object') return

  const { shutdownSemver, ...ret } = remoteConfigValue

  if (typeof shutdownSemver === 'string' && semver.validRange(shutdownSemver)) {
    ret.shutdownSemver = shutdownSemver
  }

  return ret
}
