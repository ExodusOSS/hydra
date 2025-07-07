const languageAtomMigration = async ({ atoms }) => {
  const { languageFusionAtom, languageAtom } = atoms
  const storageLanguage = await languageAtom.get()
  if (!storageLanguage) return
  languageFusionAtom.set(storageLanguage)
}

const languageAtomMigrationDefinition = {
  name: 'language-atom-to-fusion-2',
  factory: languageAtomMigration,
}

export default languageAtomMigrationDefinition
