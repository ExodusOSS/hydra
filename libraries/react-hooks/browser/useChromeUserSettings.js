import useAsync from '../common/useAsync.js'

const useChromeUserSettings = () => {
  const { loading, value } = useAsync(() => chrome.action.getUserSettings())

  const pinned = loading ? false : value.isOnToolbar

  return { loading, pinned }
}

export default useChromeUserSettings
