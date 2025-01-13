import findInvalidPrice from '../find-invalid-price'
import test from 'tape'

test('findInvalidPrice returns undefined if prices are valid', (t) => {
  t.same(
    findInvalidPrice([
      {
        close: 0,
        open: 0,
        time: 0,
      },
    ]),
    undefined
  )

  t.same(
    findInvalidPrice([
      {
        close: 0,
        open: 0,
        time: 0,
      },
      {
        close: 0,
        open: 0,
        time: 1,
      },
    ]),
    undefined
  )

  t.same(
    findInvalidPrice([
      {
        close: 1,
        open: 1,
        time: 0,
      },
      {
        close: 2,
        open: 2,
        time: 1,
      },
    ]),
    undefined
  )

  t.end()
})

test('findInvalidPrice returns invalid price if price contains non-number values', (t) => {
  t.same(
    findInvalidPrice([
      {
        close: 'string',
        open: 0,
        time: 0,
      },
    ]),
    {
      close: 'string',
      open: 0,
      time: 0,
    }
  )

  t.same(
    findInvalidPrice([
      {
        close: Infinity,
        open: 0,
        time: 0,
      },
    ]),
    {
      close: Infinity,
      open: 0,
      time: 0,
    }
  )

  t.same(
    !!findInvalidPrice([
      {
        close: NaN,
        open: 0,
        time: 0,
      },
    ]),
    true
  )

  t.end()
})

test('findInvalidPrice returns true if price is zero but previous value exists', (t) => {
  t.same(
    findInvalidPrice([
      {
        close: 1,
        open: 1,
        time: 0,
      },
      {
        close: 0,
        open: 0,
        time: 1,
      },
      {
        close: 2,
        open: 2,
        time: 2,
      },
    ]),
    {
      close: 0,
      open: 0,
      time: 1,
    }
  )

  t.same(
    findInvalidPrice([
      {
        close: 1,
        open: 1,
        time: 0,
      },
      {
        close: 2,
        open: 2,
        time: 2,
      },
      {
        close: 0,
        open: 0,
        time: 1,
      },
    ]),
    {
      close: 0,
      open: 0,
      time: 1,
    }
  )

  t.same(
    !!findInvalidPrice([
      {
        close: 1,
        open: 1,
        time: 0,
      },
      {
        close: NaN,
        open: null,
        time: 2,
      },
      {
        close: 0,
        open: 0,
        time: 1,
      },
    ]),
    true
  )

  t.same(
    !!findInvalidPrice([
      {
        close: 1,
        open: 1,
        time: 0,
      },
      {
        close: 2,
        open: 2,
        time: 2,
      },
      {
        close: null,
        open: NaN,
        time: 1,
      },
    ]),
    true
  )

  t.end()
})

test('findInvalidPrice should return invalid price if it zero but previous cache contains something', (t) => {
  t.same(
    findInvalidPrice(
      [
        {
          close: 0,
          open: 0,
          time: 1,
        },
        {
          close: 0,
          open: 0,
          time: 2,
        },
      ],
      {
        time: 0,
        close: 1,
      }
    ),
    {
      close: 0,
      open: 0,
      time: 1,
    }
  )
  t.end()
})
