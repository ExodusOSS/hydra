import { PersonalNoteSet } from '@exodus/models'

import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

const personalNotesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    personalNotes: (state, data) => ({
      ...state,
      isLoading: false,
      loaded: true,
      error: null,
      data: PersonalNoteSet.fromArray(data),
    }),
  },
  selectorDefinitions,
}

export default personalNotesReduxDefinition
