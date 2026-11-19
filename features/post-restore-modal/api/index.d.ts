declare const postRestoreModalApiDefinition: {
  id: 'postRestoreModalApi'
  type: 'api'
  factory(): {
    postRestoreModal: {
      clear: () => Promise<void>
    }
  }
}

export default postRestoreModalApiDefinition
