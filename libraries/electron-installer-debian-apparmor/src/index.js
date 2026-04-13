import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import createInstaller from 'electron-installer-debian'

import * as templates from './templates.js'

export default async function electronInstallerDebianApparmor(options) {
  if (!options.name) throw new Error('options.name is required')
  if (options.scripts) throw new Error('options.scripts cannot be set')
  // electron-installer-debian sanitizes names; we don't duplicate the logic here, we simply require valid names
  if (!/^[\da-z][\d+.a-z-]+$/u.test(options.name)) {
    throw new Error('options.name must be a valid Debian package name')
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'debian-installer-apparmor-scripts-'))
  const postinstPath = path.join(tmpDir, 'postinst_script')
  const postrmPath = path.join(tmpDir, 'postrm_script')
  const apparmorProfilePath = path.join(options.src, 'resources', 'apparmor-profile')

  try {
    const profile = templates.getProfile({ name: options.name, bin: options.bin || options.name })
    await fs.writeFile(apparmorProfilePath, profile)

    const postinstScript = templates.getPostinstScript({ name: options.name })
    await fs.writeFile(postinstPath, postinstScript)

    const postrmScript = templates.getPostrmScript({ name: options.name })
    await fs.writeFile(postrmPath, postrmScript)

    // create the package
    await createInstaller({
      ...options,
      scripts: {
        postinst: postinstPath,
        postrm: postrmPath,
      },
    })
  } finally {
    // clean up after ourselves
    await fs.rm(tmpDir, { recursive: true, force: true })
    await fs.rm(apparmorProfilePath, { force: true })
  }
}
