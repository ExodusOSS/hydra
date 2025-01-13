import { PersonalNoteSet } from '@exodus/models'

const initialState = {
  isLoading: true,
  loaded: false,
  error: null,
  data: PersonalNoteSet.EMPTY,
}

export default initialState
