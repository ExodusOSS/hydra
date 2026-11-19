import type accountSecurityReportDefinition from './report/index.js'

declare const accountSecurity: () => {
  id: 'accountSecurity'
  definitions: [{ definition: typeof accountSecurityReportDefinition }]
}

export default accountSecurity
