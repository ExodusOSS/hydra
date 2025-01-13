import useQueryParam from './useQueryParam.js'

const useIsPopup = () => {
  return useQueryParam('isPopup') === 'true'
}

export default useIsPopup
