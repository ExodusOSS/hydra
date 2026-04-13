# @exodus/electron-installer-debian-apparmor

A thin wrapper around [`electron-installer-debian`](https://github.com/electron-userland/electron-installer-debian) that adds an AppArmor profile for Ubuntu 24.04+ and other distributions that require AppArmor profiles.

## Usage

```js
import installer from '@exodus/electron-installer-debian-apparmor'

const options = {
  src: 'dist/app-linux-x64/',
  dest: 'dist/installers/',
  arch: 'amd64',
  name: 'my-app',
}

console.log('Creating package (this may take a while)')
try {
  await installer(options)
  console.log(`Successfully created package at ${options.dest}`)
} catch (err) {
  console.error(err, err.stack)
  process.exit(1)
}
```

Accepts the same [options](https://github.com/electron-userland/electron-installer-debian?tab=readme-ov-file#options) as `electron-installer-debian`, with the following differences:

- `name` must be explicitly passed as an option, and must be a [valid Debian package name](https://www.debian.org/doc/debian-policy/ch-controlfields.html#s-f-source)
- `scripts` is not supported, as this package adds its own `postinst` and `postrm` scripts

## License

MIT
