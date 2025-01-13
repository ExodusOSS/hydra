declare const localeApiDefinition: {
  id: 'localeApi'
  type: 'api'
  factory(): {
    locale: {
      setLanguage(name: string): Promise<void>
      setCurrency(name: string): Promise<void>
    }
  }
}

export default localeApiDefinition
