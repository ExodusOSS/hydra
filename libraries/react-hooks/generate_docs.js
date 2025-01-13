import fs from 'fs/promises'
import path from 'path'
import babelParser from '@babel/parser' // eslint-disable-line import/no-extraneous-dependencies

const directories = process.argv.slice(2)

const run = async () => {
  directories.forEach(async (dirName) => {
    const allFilesList = await fs.readdir(dirName)
    const componentFileNames = []
    const parsedMap = new Map()

    await Promise.all(
      allFilesList.map(async (fileName) => {
        const fullPath = path.join(dirName, fileName)
        const stat = await fs.stat(fullPath)

        if (fileName !== 'index.js' && stat.isFile() && fileName.endsWith('.js')) {
          componentFileNames.push(fileName)
        }
      })
    )

    await Promise.all(
      componentFileNames.map(async (fileName) => {
        const fullPath = path.join(dirName, fileName)
        const contents = await fs.readFile(fullPath)

        const parsedTree = babelParser.parse(contents.toString('utf8'), {
          sourceType: 'module',
          plugins: ['jsx'],
        })

        const comments = []

        parsedTree.program.body.forEach((node) => {
          if (Array.isArray(node.leadingComments)) {
            node.leadingComments.forEach((node) => {
              if (!node.value || node.value.includes('eslint-disable-')) {
                return
              }

              const lines = node.value.split('\n')
              comments.push(...lines)
            })
          }
        })

        const result = {
          title: fileName.replace('.js', ''),
          path: path.join(dirName, fileName.replace('.js', '')),
          comments,
        }

        parsedMap.set(fileName, result)
      })
    )

    const readmeLines = [`# ${dirName}`, '']
    const keys = [...parsedMap.keys()].sort()

    keys.forEach((fileName) => {
      const { title, path, comments } = parsedMap.get(fileName)

      readmeLines.push(
        `## ${title}`,
        '',
        '```javascript',
        `import ${title} from '@exodus/react-hooks/${path}'`,
        '```',
        ...comments,
        ''
      )
    })

    await fs.writeFile(path.join(dirName, 'README.md'), readmeLines.join('\n'))
  })
}

run()
