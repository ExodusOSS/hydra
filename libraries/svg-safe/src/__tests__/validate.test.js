import fs from 'fs'
import path from 'path'

import { validate, validateTrusted } from '../index.mjs'

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

describe('Valid Trusted SVGs', () => {
  const folder = path.resolve(path.join(import.meta.dirname, 'fixtures/valid-trusted'))
  const files = fs.readdirSync(folder)
  test.each(files.filter((file) => file.endsWith('.svg')))(
    '%s should be valid with isTrusted',
    async (fileName) => {
      const filePath = path.join(folder, fileName)
      const svgContent = fs.readFileSync(filePath).toString('utf8')
      expect(svgContent).toBeTruthy()
      validateTrusted(svgContent)
    }
  )

  test.each(files.filter((file) => file.endsWith('.svg')))(
    '%s should be invalid without isTrusted',
    async (fileName) => {
      const filePath = path.join(folder, fileName)
      const svgContent = fs.readFileSync(filePath).toString('utf8')
      expect(svgContent).toBeTruthy()
      expect(() => validate(svgContent)).toThrow()
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

describe('Invalid Trusted SVGs', () => {
  const folder = path.resolve(path.join(import.meta.dirname, 'fixtures/invalid-trusted'))
  const files = fs.readdirSync(folder)
  test.each(files.filter((file) => file.endsWith('.svg')))(
    '%s should be invalid even with isTrusted',
    async (fileName) => {
      const filePath = path.join(folder, fileName)
      const svgContent = fs.readFileSync(filePath).toString('utf8')
      expect(svgContent).toBeTruthy()
      expect(() => validateTrusted(svgContent)).toThrow()
    }
  )
})
