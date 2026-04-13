import { compute } from '@exodus/atoms'
import selector from './selector.js'
import memoizeOne from 'memoize-one'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { isEqual } = lodash

const createAvailableAssetNamesAtom = ({ availableAssetsAtom }) =>
  compute({
    atom: availableAssetsAtom,
    selector: memoizeOne(selector, isEqual),
  })

export default createAvailableAssetNamesAtom
