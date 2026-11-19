import { compute, createInMemoryAtom } from '@exodus/atoms'
import { SafeError } from '@exodus/errors'
import { safeString } from '@exodus/safe-string'
import { z } from '@exodus/zod'

import createReporting from '../reporting.js'

const createReport = (namespace, value, schema) => ({
  namespace,
  export: typeof value === 'function' ? value : async () => value,
  getSchema: () => schema,
})

const setup = ({ exists = async () => true, lockedAtom, reports = [] } = {}) =>
  createReporting({
    ioc: {
      get: () => () => ({ debug: () => {} }),
      getAll: () => ({
        wallet: { exists },
        lockedAtom: lockedAtom ?? createInMemoryAtom({ defaultValue: true }),
      }),
      getByType: () => reports,
    },
  })

describe('reporting state failures', () => {
  it('preserves ungated diagnostics and an unknown wallet state when the seed read fails', async () => {
    const error = Object.assign(new Error('private seed payload'), {
      hint: safeString`KeychainError [E_CRYPTO_FAILED]`,
    })
    const reporting = setup({
      exists: async () => {
        throw error
      },
      reports: [
        createReport('deviceInfo', { model: 'phone' }, z.object({ model: z.string() })),
        createReport('version', '26.10.2', z.string()),
        createReport('platformErrors', [], z.array(z.instanceof(SafeError))),
        createReport(
          'application',
          (state) => state,
          z.object({
            walletExists: z.boolean().nullable(),
            isLocked: z.boolean(),
          })
        ),
        createReport(
          'walletData',
          ({ walletExists }) => (walletExists ? 'wallet' : null),
          z.string().nullable()
        ),
      ],
    })

    const result = await reporting.export()

    expect(result).toMatchObject({
      deviceInfo: { model: 'phone' },
      version: '26.10.2',
      platformErrors: [],
      application: { walletExists: null, isLocked: true },
      walletData: null,
      reporting: {
        walletExists: null,
        isLocked: true,
        errors: { walletExists: expect.any(SafeError) },
      },
    })
    const serialized = JSON.parse(JSON.stringify(result))
    expect(serialized.reporting.errors.walletExists.hint).toBe('KeychainError [E_CRYPTO_FAILED]')
    expect(JSON.stringify(result)).not.toContain('private seed payload')
  })

  it('treats reports as locked when the lock state cannot be read', async () => {
    const lockedAtom = compute({
      atom: createInMemoryAtom({ defaultValue: true }),
      selector: () => {
        throw new Error('private lock state')
      },
    })
    const reporting = setup({
      lockedAtom,
      reports: [
        createReport(
          'lockGated',
          ({ isLocked }) => (isLocked ? null : 'unlocked data'),
          z.string().nullable()
        ),
      ],
    })

    await expect(reporting.export()).resolves.toMatchObject({
      lockGated: null,
      reporting: {
        walletExists: true,
        isLocked: null,
        errors: { isLocked: expect.any(SafeError) },
      },
    })
  })

  it.each([true, false])('preserves healthy wallet state %s', async (exists) => {
    const reporting = setup({
      exists: async () => exists,
      lockedAtom: createInMemoryAtom({ defaultValue: false }),
      reports: [
        createReport(
          'state',
          (state) => state,
          z.object({
            walletExists: z.boolean(),
            isLocked: z.boolean(),
          })
        ),
      ],
    })

    await expect(reporting.export()).resolves.toEqual({
      state: { walletExists: exists, isLocked: false },
    })
  })
})
