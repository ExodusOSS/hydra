import { useContext } from 'react'

import HeadlessContext from '../context/index.js'

const useSelectors = () => useContext(HeadlessContext).selectors

export default useSelectors
