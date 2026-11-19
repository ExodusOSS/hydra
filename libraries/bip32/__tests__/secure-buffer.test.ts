import assert from 'assert'

import { concatSecret, copySecret, wipe } from '../src/secure-buffer.js'

const ownsMemory = (buffer: Buffer) =>
  buffer.byteOffset === 0 && buffer.buffer.byteLength === buffer.length

describe('copySecret', function () {
  it('copies the bytes', function () {
    const source = Uint8Array.from([1, 2, 3])
    const copy = copySecret(source)
    source.fill(0)

    assert.deepEqual([...copy], [1, 2, 3])
  })

  it('owns its memory', function () {
    assert.equal(ownsMemory(copySecret(new Uint8Array(32))), true)
  })
})

describe('concatSecret', function () {
  it('joins the parts in order', function () {
    assert.deepEqual([...concatSecret(Uint8Array.from([1]), Uint8Array.from([2, 3]))], [1, 2, 3])
  })

  it('matches Buffer.concat for random inputs', function () {
    for (let i = 0; i < 100; i++) {
      const parts = Array.from({ length: 1 + (i % 4) }, () =>
        Buffer.from(Array.from({ length: i % 40 }, (_, byte) => byte & 0xff))
      )

      assert.equal(Buffer.compare(concatSecret(...parts), Buffer.concat(parts)), 0)
    }
  })

  it('owns its memory', function () {
    assert.equal(ownsMemory(concatSecret(new Uint8Array(1), new Uint8Array(32))), true)
  })
})

describe('wipe', function () {
  it('zeroes the buffer in place', function () {
    const secret = Buffer.alloc(32, 0xff)
    wipe(secret)

    assert.equal(
      secret.every((byte) => byte === 0),
      true
    )
  })

  it('zeroes only the view it is given', function () {
    const backing = Buffer.alloc(8, 0xff)
    wipe(backing.subarray(2, 4))

    assert.deepEqual([...backing], [255, 255, 0, 0, 255, 255, 255, 255])
  })

  it('tolerates an absent buffer', function () {
    for (const absent of [null, undefined]) {
      assert.doesNotThrow(() => wipe(absent))
    }
  })
})
