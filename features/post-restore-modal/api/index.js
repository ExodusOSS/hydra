const createRestoreModalApi = ({ shouldShowPostRestoredModalAtom }) => ({
  postRestoreModal: {
    clear: () => shouldShowPostRestoredModalAtom.set(undefined),
  },
})

const postRestoreModalApiDefinition = {
  id: 'postRestoreModalApi',
  type: 'api',
  factory: createRestoreModalApi,
  dependencies: ['shouldShowPostRestoredModalAtom'],
}

export default postRestoreModalApiDefinition
