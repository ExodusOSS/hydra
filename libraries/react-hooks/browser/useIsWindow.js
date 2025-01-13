import useQueryParam from './useQueryParam.js'

const useIsWindow = () => {
  return useQueryParam('isWindow') === 'true'
}

export default useIsWindow
