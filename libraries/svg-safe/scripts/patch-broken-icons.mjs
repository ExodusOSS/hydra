#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cleanupTrusted, validateTrusted } from '../src/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const brokenIconsDir = path.join(__dirname, 'broken-icons')

function patchSvg(svg) {
  let patched = svg
  patched = patched.replace(/<filter[^>]*>[\S\s]*?<\/filter>/gu, '')
  patched = patched.replace(/<filter[^>]*\/>/gu, '')
  patched = patched.replace(/\s*filter="[^"]*"/gu, '')
  patched = patched.replace(/\s*style="mix-blend-mode:[^"]*"/gu, '')
  patched = patched.replace(/\s*color-interpolation-filters="[^"]*"/gu, '')
  patched = patched.replace(/<use([^>]*)\/>/gu, '<use$1></use>')
  patched = patched.replace(/<g([^>]*)\/>/gu, '<g$1></g>')
  patched = patched.replace(/<mask([^>]*)\/>/gu, '<mask$1></mask>')
  patched = patched.replace(/<linearGradient([^>]*)\/>/gu, '<linearGradient$1></linearGradient>')
  patched = patched.replace(/<radialGradient([^>]*)\/>/gu, '<radialGradient$1></radialGradient>')
  patched = patched.replace(/<radialGradient([^>]*)>/gu, (match, attrs) => {
    const fixed = attrs.replace(/\b(cx|cy|fx|fy|r)="([\d.]+)%"/gu, (_, attr, val) => {
      return `${attr}="${parseFloat(val) / 100}"`
    })
    return `<radialGradient${fixed}>`
  })
  return patched
}

const files = readdirSync(brokenIconsDir).filter((f) => f.endsWith('.svg'))

console.log(`Patching ${files.length} broken icons...\n`)

let successCount = 0
let failCount = 0

for (const file of files) {
  const filePath = path.join(brokenIconsDir, file)
  const svg = readFileSync(filePath, 'utf8')
  const patched = patchSvg(svg)

  try {
    const cleaned = cleanupTrusted(patched)
    validateTrusted(cleaned)
    writeFileSync(filePath, cleaned)
    console.log(`✓ ${file}`)
    successCount++
  } catch (error) {
    console.log(`✗ ${file}: ${error.message}`)
    failCount++
  }
}

console.log(`\nResults: ${successCount} patched, ${failCount} failed`)
