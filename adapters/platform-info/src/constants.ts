export enum OsFamily {
  Linux = 'linux',
  Mac = 'darwin',
  Windows = 'win32',
  Android = 'android',
}

export const OS_FAMILY_BY_NAME = new Map([
  ['mac', OsFamily.Mac],
  ['win', OsFamily.Windows],
  ['android', OsFamily.Android],
  ['cros', OsFamily.Linux],
  ['linux', OsFamily.Linux],
  ['openbsd', OsFamily.Linux],
  ['fuchsia', OsFamily.Linux],
])
