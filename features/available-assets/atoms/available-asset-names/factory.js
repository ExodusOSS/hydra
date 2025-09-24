import { compute } from '@exodus/atoms'
import selector from './selector.js'
import memoizeOne from 'memoize-one'
import lodash from 'lodash'

const { isEqual } = lodash

const createAvailableAssetNamesAtom = ({ availableAssetsAtom }) =>
  compute({
    atom: availableAssetsAtom,
    selector: memoizeOne(selector, isEqual),
  })

export default createAvailableAssetNamesAtom
