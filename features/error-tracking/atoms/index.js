import { createInMemoryAtom } from '@exodus/atoms'

/* errorsAtom schema:
  {
    errors: [{ `namespace`, `error`, `context`, `time` }, ...]
  }
*/
const errorsAtomDefinition = {
  id: 'errorsAtom',
  type: 'atom',
  factory: () => createInMemoryAtom({ defaultValue: { errors: [] } }),
  dependencies: [],
}

export default errorsAtomDefinition
