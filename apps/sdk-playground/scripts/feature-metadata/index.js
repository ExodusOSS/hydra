import fs from 'node:fs'
import path from 'node:path'
import restrictConcurrency from 'make-concurrent'

const featuresDir = path.resolve(process.argv[2])
const features = fs.readdirSync(featuresDir)

const metadata = {}

const isPublic = restrictConcurrency(
  async (name) => {
    const response = await fetch(`https://registry.npmjs.org/${name}`, {
      method: 'HEAD',
    })

    return response.status !== 404
  },
  { concurrency: 20 }
)

await Promise.all(
  features.map(async (feature) => {
    const packageJsonPath = path.join(featuresDir, feature, 'package.json')
    const { name, version, description, homepage } = JSON.parse(
      await fs.promises.readFile(packageJsonPath, 'utf8')
    )

    metadata[feature] = {
      package: name,
      version,
      description,
      homepage: homepage.replace('ExodusMovement/exodus-hydra', 'ExodusOSS/hydra'),
      public: await isPublic(name),
    }
  })
)

const outputPath = path.resolve('./metadata.json')

fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2))
