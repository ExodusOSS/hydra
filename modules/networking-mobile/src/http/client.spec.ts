import { RequestInit as RequestInitSpec } from '@exodus/networking-common/http'
import { testsuite } from '@exodus/networking-spec/http'
import { File } from '../form'
import { Buffer } from 'buffer'
import NativeFormData from 'react-native/Libraries/Network/FormData'
import { HttpClient } from './index'
import FormData from '../form/form-data'
import { Request } from './types'
import { OperatingSystem } from '../shared/types'

type FetchMock = jest.Mock<ReturnType<typeof fetch>, [string, RequestInit]>

/* eslint-disable @typescript-eslint/no-explicit-any */
type Response = { status: number; json: () => Promise<any> }

describe('Testsuite with mockadapter', () => {
  let requests: (RequestInitSpec & { url: string })[]
  let response: Promise<Response>
  let rejectResponse: (reason: Error) => void
  let fetchMock: typeof fetch

  beforeEach(() => {
    response = new Promise((resolve, reject) => {
      rejectResponse = reject
    })
    fetchMock = jest.fn((url: string, { body: _, ...initWithoutBody }: Request) => {
      requests.push({ url, ...initWithoutBody } as never)
      return response
    }) as never
    requests = []
  })

  describe('HttpClient', () => {
    beforeEach(() => {
      response = Promise.resolve({ status: 200, json: () => Promise.resolve() })
    })

    describe('body transformation', () => {
      const uuid = 'ABCD1234'
      ;[
        {
          android: true,
          TemporaryDirectoryPath: 'tmp/files',
          path: `file://tmp/files/${uuid}-passport.jpg`,
        },
        {
          android: true,
          TemporaryDirectoryPath: 'tmp/files/',
          path: `file://tmp/files/${uuid}-passport.jpg`,
        },
        {
          android: false,
          TemporaryDirectoryPath: '/tmp/files/',
          path: `/tmp/files/${uuid}-passport.jpg`,
        },
        {
          android: false,
          TemporaryDirectoryPath: '/tmp/files',
          path: `/tmp/files/${uuid}-passport.jpg`,
        },
      ].forEach(({ android, TemporaryDirectoryPath, path }) => {
        const os = android ? OperatingSystem.Android : OperatingSystem.iOS
        it(`should transform body to native FormData (on ${os}) with temp directory path ${TemporaryDirectoryPath}`, async () => {
          const writeFile = jest.fn()

          const client = new HttpClient(
            { writeFile, TemporaryDirectoryPath, unlink: jest.fn() },
            os,
            () => uuid,
            fetchMock
          )
          const buffer = Buffer.from(['massive amounts of pixels'])
          const data = new FormData()
          data.append('name', 'Bruce Wayne')
          data.append('passport_picture', new File(buffer, 'passport.jpg'))

          await client.fetch('/upload', {
            method: 'POST',
            body: data,
          })

          expect(writeFile).toHaveBeenCalledWith(path, buffer.toString('base64'), 'base64')
          const fetch = fetchMock as FetchMock
          const init = fetch.mock.calls[0][1].body as unknown as NativeFormData

          const nameEntry = init._parts.find(([key]) => key === 'name')
          const fileEntry = init._parts.find(([key]) => key === 'passport_picture')

          expect(nameEntry?.[1]).toEqual('Bruce Wayne')
          expect(fileEntry?.[1]).toEqual({
            name: 'passport.jpg',
            uri: path,
            type: 'image/jpeg',
          })
        })
      })

      describe('cleanup', () => {
        let unlink: jest.Mock
        let client: HttpClient
        let data: FormData

        const uuid = 'abcd'

        beforeEach(() => {
          unlink = jest.fn()
          client = new HttpClient(
            { writeFile: jest.fn(), TemporaryDirectoryPath: 'tmp/files', unlink },
            OperatingSystem.Android,
            () => uuid,
            fetchMock
          )
          data = new FormData()
          data.append(
            'passport_picture',
            new File(Buffer.from(['massive amounts of pixels']), 'passport.jpg')
          )
        })

        it(`should remove temporary files created for upload`, async () => {
          await client.fetch('/upload', {
            method: 'POST',
            body: data,
          })

          expect(unlink).toHaveBeenCalledWith(`file://tmp/files/${uuid}-passport.jpg`)
        })

        it(`should unlink temporary files created for upload on failed request`, async () => {
          try {
            ;(fetchMock as FetchMock).mockRejectedValue(false)

            await client.fetch('/upload', {
              method: 'POST',
              body: data,
            })
          } catch {
            expect(unlink).toHaveBeenCalledWith(`file://tmp/files/${uuid}-passport.jpg`)
          }
        })
      })

      describe('mime types', () => {
        ;[
          { extension: 'jpg', mimeType: 'image/jpeg' },
          { extension: 'png', mimeType: 'image/png' },
          { extension: 'PNG', mimeType: 'image/png' },
          { extension: 'jpeg', mimeType: 'image/jpeg' },
          { extension: 'pdf', mimeType: 'application/pdf' },
          { extension: undefined, mimeType: 'application/octet-stream' },
          { extension: 'something-else', mimeType: 'application/octet-stream' },
        ].forEach(({ extension, mimeType }) => {
          it(`should map ${extension ?? 'no extension'} to mime type ${mimeType}`, async () => {
            const client = new HttpClient(
              { writeFile: jest.fn(), TemporaryDirectoryPath: 'tmp/files', unlink: jest.fn() },
              OperatingSystem.Android,
              () => 'some uuid',
              fetchMock
            )
            const data = new FormData()
            const extensionOrEmpty = extension ? `.${extension}` : ''
            const filename = `passport${extensionOrEmpty}`
            data.append(
              'passport_picture',
              new File(Buffer.from(['massive amounts of pixels']), filename)
            )

            await client.fetch('/upload', {
              method: 'POST',
              body: data,
            })

            const init = (fetchMock as FetchMock).mock.calls[0][1].body as unknown as NativeFormData
            const value = init._parts.find(([key]) => key === 'passport_picture')?.[1]

            expect(value).toEqual(expect.objectContaining({ type: mimeType }))
          })
        })
      })
    })
  })

  testsuite(
    () =>
      new HttpClient(
        { writeFile: jest.fn(), TemporaryDirectoryPath: '', unlink: jest.fn() },
        OperatingSystem.iOS,
        () => '',
        fetchMock
      ) as never,
    {
      replyWith(status, body) {
        response = Promise.resolve({
          status,
          json: () => Promise.resolve(body),
        })
      },
      requests() {
        return requests
      },
    }
  )

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.AbortController = class {
    abort() {
      rejectResponse(new Error(`Timeout: Request did not complete in time`))
    }
  }
})
