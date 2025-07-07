import fs from 'fs'
import path from 'path'

import { validate } from '../validate.mjs'

describe('Valid SVGs', () => {
  const folder = path.resolve(path.join(import.meta.dirname, 'fixtures/valid'))
  const files = fs.readdirSync(folder)
  test.each(files.filter((file) => file.endsWith('.svg')))(
    '%s should be a valid SVG',
    async (fileName) => {
      const filePath = path.join(folder, fileName)
      const svgContent = fs.readFileSync(filePath).toString('utf8')
      expect(svgContent).toBeTruthy()
      validate(svgContent)
    }
  )
})

describe('Invalid SVGs', () => {
  const folder = path.resolve(path.join(import.meta.dirname, 'fixtures/invalid'))
  const files = fs.readdirSync(folder)
  test.each(files.filter((file) => file.endsWith('.svg')))(
    '%s should be invalid SVG',
    async (fileName) => {
      const filePath = path.join(folder, fileName)
      const svgContent = fs.readFileSync(filePath).toString('utf8')
      expect(svgContent).toBeTruthy()
      expect(() => validate(svgContent)).toThrow()
    }
  )
})
