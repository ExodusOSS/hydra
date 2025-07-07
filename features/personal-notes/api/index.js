const createPersonalNotesApi = ({ personalNotes }) => ({
  personalNotes: {
    upsert: personalNotes.upsert,
  },
})

const personalNotesApiDefinition = {
  id: 'personalNotesApi',
  type: 'api',
  factory: createPersonalNotesApi,
  dependencies: ['personalNotes'],
}

export default personalNotesApiDefinition
