const fusionMerge = require('.')

test('object merging', () => {
  const a = Math.random()
  const b = Math.random()
  const profile = fusionMerge(
    { obj: { a }, private: { obj: { a } } },
    { obj: { b }, private: { obj: { b } } }
  )
  expect(profile.obj.a).toBe(a)
  expect(profile.obj.b).toBe(b)
  expect(profile.private.obj.a).toBe(a)
  expect(profile.private.obj.b).toBe(b)
})

test('object merging with null prototype update', () => {
  const a = Math.random()
  const b = Math.random()
  const update = Object.create(null)
  update.obj = Object.create(null)
  update.obj.b = b
  update.private = Object.create(null)
  update.private.obj = Object.create(null)
  update.private.obj.b = b
  const profile = fusionMerge({ obj: { a }, private: { obj: { a } } }, update)
  expect(profile.obj.a).toBe(a)
  expect(profile.obj.b).toBe(b)
  expect(profile.private.obj.a).toBe(a)
  expect(profile.private.obj.b).toBe(b)
})

test('object merging with null prototype original', () => {
  const a = Math.random()
  const b = Math.random()
  const original = Object.create(null)
  original.obj = Object.create(null)
  original.obj.a = a
  original.private = Object.create(null)
  original.private.obj = Object.create(null)
  original.private.obj.a = a
  const profile = fusionMerge(original, { obj: { b }, private: { obj: { b } } })
  expect(profile.obj.a).toBe(a)
  expect(profile.obj.b).toBe(b)
  expect(profile.private.obj.a).toBe(a)
  expect(profile.private.obj.b).toBe(b)
})

test('object merging with two null prototype objects', () => {
  const a = Math.random()
  const b = Math.random()
  const original = Object.create(null)
  original.obj = Object.create(null)
  original.obj.a = a
  original.private = Object.create(null)
  original.private.obj = Object.create(null)
  original.private.obj.a = a
  const update = Object.create(null)
  update.obj = Object.create(null)
  update.obj.b = b
  update.private = Object.create(null)
  update.private.obj = Object.create(null)
  update.private.obj.b = b
  const profile = fusionMerge(original, update)
  expect(profile.obj.a).toBe(a)
  expect(profile.obj.b).toBe(b)
  expect(profile.private.obj.a).toBe(a)
  expect(profile.private.obj.b).toBe(b)
})

test('empty object replaces instead of merging', () => {
  const a = Math.random()
  const profile = fusionMerge(
    { emptyObj: { a }, private: { emptyObj: { a } } },
    { emptyObj: {}, private: { emptyObj: {} } }
  )
  expect(profile.emptyObj).toEqual({})
  expect(profile.emptyObj).not.toHaveProperty('a')
  expect(profile.private.emptyObj).toEqual({})
  expect(profile.private.emptyObj).not.toHaveProperty('a')
})

test('no array merging', () => {
  const a = Math.random()
  const b = Math.random()
  const profile = fusionMerge(
    { arr: [a], private: { arr: [a] } },
    { arr: [b], private: { arr: [b] } }
  )
  expect(profile.arr).toHaveLength(1)
  expect(profile.arr[0]).toBe(b)
  expect(profile.private.arr).toHaveLength(1)
  expect(profile.private.arr[0]).toBe(b)
})

test('no merging when object overwrites array', () => {
  const profile = fusionMerge({ nft: [42] }, { nft: { id: 'my-nft' } })

  expect(profile).toEqual({ nft: { id: 'my-nft' } })
})

test.each([null, undefined, [42]])('merging %s value when existing object', (value) => {
  const profile = fusionMerge({ nft: { id: 'my-nft' } }, { nft: value })

  expect(profile).toEqual({ nft: value })
})

test.each([undefined, null])('merging %s value', (value) => {
  const profile = fusionMerge({ nft: value }, { nft: value })

  expect(profile).toEqual({ nft: value })
})
