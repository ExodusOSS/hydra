// https://github.com/gregberge/react-merge-refs
//
// ```javascript
// const mergeRefs = useMergeRefs([ref1, ref2, ref3])
//
// mergeRefs(value)
// ```

const useMergeRefs = (refs) => (value) => {
  refs.forEach((ref) => {
    if (typeof ref === 'function') {
      ref(value)
    } else if (ref != null) {
      // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
      ref.current = value
    }
  })
}

export default useMergeRefs
