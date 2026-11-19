import createIocContainer from '@exodus/dependency-injection'

import preprocess from '../../src/index.js'
import alias from '../../src/preprocessors/alias.js'

const identity = (data) => data
const logger = console

describe('`alias` integration tests, a.k.a. Harry and Dobby play Voldemort Roulette', () => {
  it('throws on missing implementations', () => {
    const ioc = createIocContainer({ logger })
    const dependencies = [
      {
        definition: {
          id: 'quirrel',
          factory: () => 'quirrel',
        },
      },
      {
        definition: {
          id: 'harry',
          dependencies: ['quirrel'],
          factory: identity,
        },
        aliases: [
          {
            interfaceId: 'quirrel',
            implementationId: 'voldemort',
          },
        ],
      },
    ]

    const preprocessed = preprocess({
      dependencies,
      preprocessors: [alias()],
    })

    ioc.registerMultiple(preprocessed)
    expect(ioc.resolve).toThrow(/voldemort/) // voldermort is missing...uh oh
  })

  it('resolves aliases', () => {
    const ioc = createIocContainer({ logger })
    const dependencies = [
      {
        definition: {
          id: 'quirrel',
          factory: () => 'quirrel',
        },
      },
      {
        definition: {
          id: 'voldemort',
          factory: () => 'voldemort',
        },
      },
      {
        definition: {
          id: 'dobby',
          factory: identity,
          dependencies: ['quirrel'],
        },
      },
      {
        definition: {
          id: 'harry',
          dependencies: ['quirrel'],
          factory: identity,
        },
        aliases: [
          {
            interfaceId: 'quirrel',
            implementationId: 'voldemort',
          },
        ],
      },
    ]

    const preprocessed = preprocess({
      dependencies,
      preprocessors: [alias()],
    })

    ioc.registerMultiple(preprocessed)
    ioc.resolve()
    const { harry: harrysChristmasStocking, dobby: dobbysChistmasStocking } = ioc.getAll()
    expect(harrysChristmasStocking).toEqual({ quirrel: 'voldemort' })
    expect(dobbysChistmasStocking).toEqual({ quirrel: 'quirrel' })
  })
})
