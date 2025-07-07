import cropHistory from '../crop-history.js'

describe('cropHistory', () => {
  it('filters data older than hourlyLimit', () => {
    const history = new Map([
      [1_648_764_000_000, { close: 1 }],
      [1_648_767_600_000, { close: 2 }],
      [1_648_771_200_000, { close: 3 }],
      [1_648_774_800_000, { close: 4 }],
      [1_648_778_400_000, { close: 5 }],
      [1_648_782_000_000, { close: 6 }],
      [1_648_785_600_000, { close: 7 }],
      [1_648_789_200_000, { close: 8 }],
      [1_648_792_800_000, { close: 9 }],
      [1_648_796_400_000, { close: 10 }],
      [1_648_800_000_000, { close: 11 }],
    ])
    const result = cropHistory({
      history,
      hourlyLimit: 5,
    })

    expect([...result]).toEqual([
      [1_648_785_600_000, { close: 7 }],
      [1_648_789_200_000, { close: 8 }],
      [1_648_792_800_000, { close: 9 }],
      [1_648_796_400_000, { close: 10 }],
      [1_648_800_000_000, { close: 11 }],
    ])
  })

  it('works fine if history is incomplete', () => {
    const history = new Map([
      [1_648_796_400_000, { close: 10 }],
      [1_648_800_000_000, { close: 11 }],
    ])
    const result = cropHistory({
      history,
      hourlyLimit: 5,
    })

    expect([...result]).toEqual([
      [1_648_796_400_000, { close: 10 }],
      [1_648_800_000_000, { close: 11 }],
    ])
  })

  it('works fine if history is empty', () => {
    const history = new Map([])
    const result = cropHistory({
      history,
      hourlyLimit: 5,
    })

    expect([...result]).toEqual([])
  })
})
