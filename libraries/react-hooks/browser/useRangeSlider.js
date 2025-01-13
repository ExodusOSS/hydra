import { useCallback, useMemo, useRef, useState } from 'react'

// Based on react-ranger

const getBoundingClientRect = (element) => {
  const rect = element.getBoundingClientRect()
  return {
    left: Math.ceil(rect.left),
    width: Math.ceil(rect.width),
  }
}

const sortNumList = (arr) => [...arr].sort((a, b) => Number(a) - Number(b))

const useGetLatest = (val) => {
  const ref = useRef(val)
  ref.current = val
  return useCallback(() => ref.current, [])
}

const linearInterpolator = {
  getPercentageForValue: (val, min, max) => {
    return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
  },
  getValueForClientX: (clientX, trackDims, min, max) => {
    const { left, width } = trackDims
    const percentageValue = (clientX - left) / width
    const value = (max - min) * percentageValue
    return value + min
  },
}

const useRangeSlider = ({
  interpolator = linearInterpolator,
  values,
  min,
  max,
  onChange,
  onDrag,
  stepSize,
}) => {
  const [activeHandleIndex, setActiveHandleIndex] = useState(null)
  const [tempValues, setTempValues] = useState()

  const getLatest = useGetLatest({
    activeHandleIndex,
    onChange,
    onDrag,
    values,
    tempValues,
  })

  const trackElRef = useRef()

  const getValueForClientX = useCallback(
    (clientX) => {
      const trackDims = getBoundingClientRect(trackElRef.current)
      return interpolator.getValueForClientX(clientX, trackDims, min, max)
    },
    [interpolator, max, min]
  )

  const roundToStep = useCallback(
    (val) => {
      const clampedVal = Math.max(Math.min(val, max), min)
      return stepSize * Math.round(clampedVal / stepSize)
    },
    [max, min, stepSize]
  )

  const handleDrag = useCallback(
    (e) => {
      const { activeHandleIndex, onDrag } = getLatest()
      const clientX = e.type === 'touchmove' ? e.changedTouches[0].clientX : e.clientX
      const newValue = getValueForClientX(clientX)
      const newRoundedValue = roundToStep(newValue)

      const newValues = [
        ...values.slice(0, activeHandleIndex),
        newRoundedValue,
        ...values.slice(activeHandleIndex + 1),
      ]

      if (onDrag) {
        onDrag(newValues)
      } else {
        setTempValues(newValues)
      }
    },
    [getLatest, getValueForClientX, roundToStep, values]
  )

  const handlePress = useCallback(
    (e, i) => {
      setActiveHandleIndex(i)

      const handleRelease = (e) => {
        const { tempValues, values, onChange = () => {}, onDrag = () => {} } = getLatest()

        document.removeEventListener('mousemove', handleDrag)
        document.removeEventListener('touchmove', handleDrag)
        document.removeEventListener('mouseup', handleRelease)
        document.removeEventListener('touchend', handleRelease)
        const sortedValues = sortNumList(tempValues || values)
        onChange(sortedValues)
        onDrag(sortedValues)
        setActiveHandleIndex(null)
        setTempValues()
      }

      document.addEventListener('mousemove', handleDrag)
      document.addEventListener('touchmove', handleDrag)
      document.addEventListener('mouseup', handleRelease)
      document.addEventListener('touchend', handleRelease)
    },
    [getLatest, handleDrag]
  )

  const getPercentageForValue = useCallback(
    (val) => interpolator.getPercentageForValue(val, min, max),
    [interpolator, max, min]
  )

  const segments = useMemo(() => {
    const sortedValues = sortNumList(tempValues || values)

    return [...sortedValues, max].map((value, i) => ({
      value,
      getSegmentProps: ({ key = i, style = {}, ...rest } = {}) => {
        const left = getPercentageForValue(sortedValues[i - 1] ? sortedValues[i - 1] : min)
        const width = getPercentageForValue(value) - left
        return {
          key,
          style: {
            position: 'absolute',
            left: `${left}%`,
            width: `${width}%`,
            ...style,
          },
          ...rest,
        }
      },
    }))
  }, [getPercentageForValue, max, min, tempValues, values])

  const handles = useMemo(
    () =>
      (tempValues || values).map((value, i) => ({
        value,
        active: i === activeHandleIndex,
        getHandleProps: ({
          key = i,
          ref,
          innerRef = () => {},
          onKeyDown,
          onMouseDown,
          onTouchStart,
          style = {},
          ...rest
        } = {}) => ({
          key,
          onMouseDown: (e) => {
            e.persist()
            handlePress(e, i)
            if (onMouseDown) onMouseDown(e)
          },
          onTouchStart: (e) => {
            e.persist()
            handlePress(e, i)
            if (onTouchStart) onTouchStart(e)
          },
          role: 'slider',
          style: {
            position: 'absolute',
            top: '50%',
            left: `${getPercentageForValue(value)}%`,
            zIndex: i === activeHandleIndex ? '1' : '0',
            transform: 'translate(-50%, -50%)',
            ...style,
          },
          ...rest,
        }),
      })),
    [activeHandleIndex, getPercentageForValue, handlePress, tempValues, values]
  )

  const getTrackProps = ({ style = {}, ref, ...rest } = {}) => {
    return {
      ref: (el) => {
        trackElRef.current = el
        if (ref) {
          if (typeof ref === 'function') {
            ref(el)
          } else {
            // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
            ref.current = el
          }
        }
      },
      style: {
        position: 'relative',
        userSelect: 'none',
        ...style,
      },
      ...rest,
    }
  }

  return {
    activeHandleIndex,
    getTrackProps,
    handles,
    segments,
  }
}

export default useRangeSlider
