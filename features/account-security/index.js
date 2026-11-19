import { safeString } from '@exodus/safe-string'

import accountSecurityReportDefinition from './report/index.js'

const accountSecurity = () => {
  return {
    id: safeString`accountSecurity`,
    definitions: [{ definition: accountSecurityReportDefinition }],
  }
}

export default accountSecurity
