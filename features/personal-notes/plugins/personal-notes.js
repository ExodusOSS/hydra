import { createAtomObserver } from '@exodus/atoms'

const createPersonalNotesPlugin = ({ port, personalNotesAtom, personalNotes }) => {
  const personalNotesAtomObserver = createAtomObserver({
    port,
    atom: personalNotesAtom,
    event: 'personalNotes',
  })

  const onStart = () => {
    personalNotesAtomObserver.register()
  }

  const onLoad = () => {
    personalNotesAtomObserver.start()
  }

  const onClear = async () => {
    await personalNotes.clear()
  }

  const onStop = () => {
    personalNotesAtomObserver.unregister()
  }

  return {
    onStart,
    onLoad,
    onClear,
    onStop,
  }
}

export default createPersonalNotesPlugin
