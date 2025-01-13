import { fileURLToPath } from 'node:url'

import path from 'path'

const __filename = fileURLToPath(import.meta.url)

export const getAppPath = ({ applicationName, model, appVersion }) => {
  const appsDirectory = path.join(path.dirname(__filename), '../../../apps')
  return path.join(
    appsDirectory,
    `${applicationName}-${appVersion.replaceAll('.', '-')}-${model}.elf`
  )
}
