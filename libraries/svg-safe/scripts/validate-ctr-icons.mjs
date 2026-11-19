#!/usr/bin/env node

import { gunzipSync } from 'node:zlib'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { cleanupTrusted, validateTrusted } from '../src/index.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const envPath = path.join(__dirname, '.env')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  }
}

const CTR_BASE_URL = process.env.CTR_BASE_URL || 'https://ctr.a.exodus.io'
const AUTH_TOKEN = process.env.CTR_AUTHORIZATION_TOKEN || ''
const reportPath = path.join(__dirname, 'ctr-validation-report.json')
const brokenIconsDir = path.join(__dirname, 'broken-icons')

function buildErrorsByReason(invalidTokens) {
  const errorsByReason = {}
  for (const token of invalidTokens) {
    const reason = token.error.split('\n')[0]
    if (!errorsByReason[reason]) {
      errorsByReason[reason] = []
    }

    errorsByReason[reason].push(token.name)
  }

  return errorsByReason
}

function loadCheckpoint() {
  if (existsSync(reportPath)) {
    const data = JSON.parse(readFileSync(reportPath, 'utf8'))
    if (data.checkpoint) {
      console.log(
        `Resuming from checkpoint (lastId: ${data.checkpoint.lastId}, processed: ${data.checkpoint.totalProcessed})`
      )
      const invalidTokens = data.invalidTokens || []
      return {
        lastId: data.checkpoint.lastId,
        totalProcessed: data.checkpoint.totalProcessed,
        validCount: data.summary?.valid || 0,
        noIconCount: data.summary?.noIcon || 0,
        results: { invalid: invalidTokens, noIcon: [] },
        errorsByReason: buildErrorsByReason(invalidTokens),
      }
    }
  }

  return {
    lastId: null,
    totalProcessed: 0,
    validCount: 0,
    noIconCount: 0,
    results: { invalid: [], noIcon: [] },
    errorsByReason: {},
  }
}

function saveReport(validCount, results, checkpoint = null) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      valid: validCount,
      invalid: results.invalid.length,
      noIcon: results.noIcon.length,
    },
    invalidTokens: results.invalid,
  }
  if (checkpoint) {
    report.checkpoint = checkpoint
  }

  writeFileSync(reportPath, JSON.stringify(report, null, 2))
}

async function fetchAndValidateTokens(processPage, checkpoint) {
  let lastId = checkpoint.lastId
  let totalProcessed = checkpoint.totalProcessed
  let isFirstPage = lastId === null && totalProcessed === 0

  while (lastId !== null || isFirstPage) {
    isFirstPage = false
    const body = {
      hasIcon: true,
      includeIcon: true,
      limit: 10,
    }
    if (lastId) {
      body.lastId = lastId
    }

    const response = await fetch(`${CTR_BASE_URL}/registry/tokensByNetworkV2`, {
      method: 'POST',
      headers: {
        Authorization: AUTH_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Failed to fetch tokens: ${response.status} ${errorBody}`)
    }

    const data = await response.json()
    const tokens = data.tokens || []
    totalProcessed += tokens.length
    lastId = data.lastId || null

    await processPage(tokens, totalProcessed, lastId)
  }

  return totalProcessed
}

function unzipIcon(base64) {
  const buff = Buffer.from(base64, 'base64')
  const data = gunzipSync(buff)
  return data.toString('utf8')
}

async function validateToken(token) {
  if (!token.icon) {
    return { name: token.name, status: 'no-icon' }
  }

  const svg = unzipIcon(token.icon)
  try {
    const cleaned = cleanupTrusted(svg)
    validateTrusted(cleaned)
    return { name: token.name, status: 'valid' }
  } catch (error) {
    const iconPath = path.join(brokenIconsDir, `${token.assetName}.svg`)
    writeFileSync(iconPath, svg)
    return {
      name: token.name,
      status: 'invalid',
      error: error.message,
      assetId: token.assetId,
      assetName: token.assetName,
      baseAssetName: token.baseAssetName,
    }
  }
}

async function main() {
  console.log('SVG-Safe CTR Icons Validator')
  console.log('============================\n')

  if (!AUTH_TOKEN) {
    console.warn('Warning: CTR_AUTHORIZATION_TOKEN not set. Some requests may fail.\n')
  }

  if (!existsSync(brokenIconsDir)) {
    mkdirSync(brokenIconsDir, { recursive: true })
  }

  const checkpoint = loadCheckpoint()
  let validCount = checkpoint.validCount
  const results = checkpoint.results
  const errorsByReason = checkpoint.errorsByReason

  console.log(`Fetching and validating tokens...`)
  try {
    await fetchAndValidateTokens(async (tokens, totalProcessed, nextLastId) => {
      for (const token of tokens) {
        const result = await validateToken(token)
        if (result.status === 'valid') {
          validCount++
        } else if (result.status === 'invalid') {
          results.invalid.push(result)
          const reason = result.error.split('\n')[0]
          if (!errorsByReason[reason]) {
            errorsByReason[reason] = []
          }

          errorsByReason[reason].push(result.name)
        } else {
          results.noIcon.push(result)
        }
      }

      console.log(
        `Processed ${totalProcessed} tokens (valid: ${validCount}, invalid: ${results.invalid.length})`
      )

      saveReport(validCount, results, {
        lastId: nextLastId,
        totalProcessed,
      })
    }, checkpoint)
  } catch (error) {
    console.error(`Error fetching: ${error.message}`)
    console.log('Progress saved. Run again to resume.')
    process.exit(1)
  }

  console.log('\n============================')
  console.log('Results Summary')
  console.log('============================\n')
  console.log(`Valid:   ${validCount}`)
  console.log(`Invalid: ${results.invalid.length}`)
  console.log(`No Icon: ${results.noIcon.length}`)

  if (results.invalid.length > 0) {
    console.log('\n============================')
    console.log('Errors by Reason')
    console.log('============================\n')

    const sortedReasons = Object.entries(errorsByReason).sort((a, b) => b[1].length - a[1].length)

    for (const [reason, tokens] of sortedReasons) {
      console.log(`\n${reason} (${tokens.length} tokens):`)
      console.log(`  ${tokens.slice(0, 10).join(', ')}${tokens.length > 10 ? '...' : ''}`)
    }
  }

  saveReport(validCount, results)
  console.log(`\nFull report saved to: ${reportPath}`)

  process.exit(results.invalid.length > 0 ? 1 : 0)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
