import { PersonalNoteSet } from '@exodus/models'

import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

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
