import { useContext } from 'react'

import HeadlessContext from '../context/index.js'

const useExodus = () => useContext(HeadlessContext).exodus

export default useExodus
