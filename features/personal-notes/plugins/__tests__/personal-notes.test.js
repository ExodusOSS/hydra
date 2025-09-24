import { PersonalNoteSet } from '@exodus/models'

jest.doMock('@exodus/atoms/factories/observer', () => ({ __esModule: true, default: jest.fn() }))

const { createAtomObserver, createInMemoryAtom } = await import('@exodus/atoms')
const { personalNotesPluginDefinition } = await import('../index.js')

describe('personalNotesPlugin', () => {
  const data = PersonalNoteSet.fromArray([{ txId: '1', message: 'test' }])

  let port
  let personalNotes
  let personalNotesAtom
  let plugin
  let register
  let unregister
  let start

  beforeEach(() => {
    register = jest.fn()
    unregister = jest.fn()
    start = jest.fn()
    createAtomObserver.mockReturnValue({
      register,
      unregister,
      start,
    })

    port = { emit: jest.fn() }
    personalNotes = { clear: jest.fn() }
    personalNotesAtom = createInMemoryAtom({ defaultValue: data })
    plugin = personalNotesPluginDefinition.factory({ port, personalNotesAtom, personalNotes })
  })

  it('should create atom observer', () => {
    expect(createAtomObserver).toHaveBeenCalledWith({
      port,
      atom: personalNotesAtom,
      event: 'personalNotes',
    })
  })

  it('should register atom observer during start', () => {
    plugin.onStart()

    expect(register).toHaveBeenCalled()
  })

  it('should start oberserving atom when loaded', async () => {
    plugin.onLoad()

    expect(start).toHaveBeenCalled()
  })

  it('should clear on corresponding lifecycle', async () => {
    plugin.onClear()

    expect(personalNotes.clear).toHaveBeenCalled()
  })

  it('should unobserve atom when stopped', async () => {
    plugin.onStop()

    expect(unregister).toHaveBeenCalled()
  })
})
