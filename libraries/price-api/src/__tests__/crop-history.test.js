import test from 'tape'
import cropHistory from '../crop-history'

test('cropHistory filters data older than hourlyLimit', async (t) => {
  const history = new Map([
    [
      1648764000000,
      {
        close: 1,
      },
    ],
    [
      1648767600000,
      {
        close: 2,
      },
    ],
    [
      1648771200000,
      {
        close: 3,
      },
    ],
    [
      1648774800000,
      {
        close: 4,
      },
    ],
    [
      1648778400000,
      {
        close: 5,
      },
    ],
    [
      1648782000000,
      {
        close: 6,
      },
    ],
    [
      1648785600000,
      {
        close: 7,
      },
    ],
    [
      1648789200000,
      {
        close: 8,
      },
    ],
    [
      1648792800000,
      {
        close: 9,
      },
    ],
    [
      1648796400000,
      {
        close: 10,
      },
    ],
    [
      1648800000000,
      {
        close: 11,
      },
    ],
  ])
  const result = cropHistory({
    history,
    hourlyLimit: 5,
  })

  t.deepEqual(Array.from(result), [
    [1648785600000, { close: 7 }],
    [1648789200000, { close: 8 }],
    [1648792800000, { close: 9 }],
    [1648796400000, { close: 10 }],
    [1648800000000, { close: 11 }],
  ])
  t.end()
})

test('cropHistory works fine if history is incomplete', async (t) => {
  const history = new Map([
    [
      1648796400000,
      {
        close: 10,
      },
    ],
    [
      1648800000000,
      {
        close: 11,
      },
    ],
  ])
  const result = cropHistory({
    history,
    hourlyLimit: 5,
  })

  t.deepEqual(Array.from(result), [
    [1648796400000, { close: 10 }],
    [1648800000000, { close: 11 }],
  ])
  t.end()
})

test('cropHistory works fine if history is empty', async (t) => {
  const history = new Map([])
  const result = cropHistory({
    history,
    hourlyLimit: 5,
  })

  t.deepEqual(Array.from(result), [])
  t.end()
})
