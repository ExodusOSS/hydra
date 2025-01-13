const createPersonalNotesApi = ({ personalNotes }) => ({
  personalNotes: {
    upsert: personalNotes.upsert,
  },
})

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'personalNotesApi',
  type: 'api',
  factory: createPersonalNotesApi,
  dependencies: ['personalNotes'],
}
