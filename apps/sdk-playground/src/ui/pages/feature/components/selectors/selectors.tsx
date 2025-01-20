import Text from '@/ui/components/text'
import Selector from './selector.js'

function Selectors({ selectors: selectorsAndFactories }) {
  // TODO: support selector factories
  const selectors = selectorsAndFactories.filter(([, selector]) =>
    Boolean(selector.resetRecomputations)
  )
  return (
    <div>
      <Text as="h2" size={18} className="mb-4">
        Selectors
      </Text>

      {selectors.length === 0 && <p>No selectors available</p>}

      {selectors.map(([name, selector]: [string, any]) => (
        <Selector key={name} name={name} selector={selector} returnType="any" />
      ))}
    </div>
  )
}

export default Selectors
