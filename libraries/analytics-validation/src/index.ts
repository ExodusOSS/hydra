// Re-export via import so @exodus/schemasafe-babel-plugin (which only visits ImportDeclaration) can compile the schema
// oxlint-disable-next-line typescript/ban-ts-comment
// @ts-ignore -- keep bare JSON import so schemasafe-babel-plugin can rewrite this import in consumer builds.
import validateEvent from './main.schemasafe.json'

// `../lib/events.js` is generated and may be absent in a clean checkout before build-types runs.
// oxlint-disable-next-line typescript/ban-ts-comment
// @ts-ignore -- preserve the generated type re-export without making `tsc --noEmit` depend on the pre-step.
export type * from '../lib/events.js'

// At runtime the schemasafe-babel-plugin replaces the JSON import above with a
// compiled validator function, so the default export is a validator — not the
// raw schema object its static type would suggest. Type it to match runtime.
export default validateEvent as unknown as (event: unknown) => void
