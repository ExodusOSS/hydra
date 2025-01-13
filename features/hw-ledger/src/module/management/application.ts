/**
 * Apache License
 * Version 2.0, January 2004
 * Copyright 2023 Ledger
 * Copyright 2023 Exodus
 * https://github.com/LedgerHQ/ledger-live/commit/3de79a2927a1679ce4571f2c298cd404877cc49a
 */
import type Transport from '@ledgerhq/hw-transport'

export type GetInformationResponse = {
  name: string
  version: string
  flags: Buffer
}

export type ListAppResponse = {
  name: string
  hash: string
  hash_code_data: string // To match HSM response.
  blocks?: number
  flags?: number
}[]

export async function createApplicationManager(transport: Transport) {
  return {
    getInformation: async (): Promise<GetInformationResponse> => {
      const r = await transport.send(0xb0, 0x01, 0x00, 0x00)
      let i = 0
      const format = r[i++]

      if (format !== 1) {
        throw new Error('getAppAndVersion: format not supported')
      }

      const nameLength = Number(r[i++])
      const name = r.slice(i, (i += nameLength)).toString('ascii')
      const versionLength = Number(r[i++])
      const version = r.slice(i, (i += versionLength)).toString('ascii')
      const flagLength = Number(r[i++])
      const flags = r.slice(i, (i += flagLength))
      return {
        name,
        version,
        flags,
      }
    },
    listApplications: async () => {
      const payload = await transport.send(0xe0, 0xde, 0, 0)
      const apps: ListAppResponse = []
      let data = payload

      // more than the status bytes
      while (data.length > 2) {
        if (payload[0] !== 0x01) {
          throw new Error('unknown listApps format')
        }

        let i = 1

        while (i < data.length - 2) {
          const length = data[i]
          i++
          const blocks = data.readUInt16BE(i)
          i += 2
          const flags = data.readUInt16BE(i)
          i += 2
          const hashCodeData = data.slice(i, i + 32).toString('hex')
          i += 32
          const hash = data.slice(i, i + 32).toString('hex')
          i += 32
          const nameLength = Number(data[i])
          i++

          if (length !== nameLength + 70) {
            throw new Error('invalid listApps length data')
          }

          const name = data.slice(i, i + nameLength).toString('ascii')
          i += nameLength
          apps.push({
            name,
            hash,
            hash_code_data: hashCodeData,
            blocks,
            flags,
          })
        }

        // continue
        data = await transport.send(0xe0, 0xdf, 0, 0)
      }

      return apps
    },
    openApplication: async (name: string) => {
      await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'))
    },
    quitApplication: async () => {
      await transport.send(0xb0, 0xa7, 0x00, 0x00)
    },
  }
}
