import { useCallback, useEffect, useState } from 'react'

const useIsConnectionActive = () => {
  const [openedTabs, setOpenedTabs] = useState([])

  const updateOpenedTabs = () => {
    chrome.tabs.query({}).then(setOpenedTabs)
  }

  useEffect(updateOpenedTabs, [])

  const getIsConnectionActive = useCallback(
    ({ activeConnections = [] } = {}) =>
      activeConnections.some((activeConnection) =>
        openedTabs.some((tab) => tab.id === activeConnection.id)
      ),
    [openedTabs]
  )

  return { getIsConnectionActive, updateOpenedTabs }
}

export default useIsConnectionActive
