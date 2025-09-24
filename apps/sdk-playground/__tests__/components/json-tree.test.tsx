import { render, screen } from '@testing-library/react'

import JSONTree from '@/ui/components/json-tree/json-tree'

describe('JSONTree Component', () => {
  const simpleData = {
    name: 'John Doe',
    age: 30,
    active: true,
  }

  test('renders simple JSON data', () => {
    render(<JSONTree data={simpleData} />)

    // Should render the property names (with colon)
    expect(screen.getByText('name:')).toBeInTheDocument()
    expect(screen.getByText('age:')).toBeInTheDocument()
    expect(screen.getByText('active:')).toBeInTheDocument()

    // Should render the values
    expect(screen.getByText('"John Doe"')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
  })

  test('renders complex nested JSON data with collapsed state', () => {
    const complexData = {
      user: { name: 'Jane', email: 'jane@test.com' },
      metadata: { created: '2024-01-01', version: 1.2 },
    }

    render(<JSONTree data={complexData} />)

    // Should render top-level keys (with colon)
    expect(screen.getByText('user:')).toBeInTheDocument()
    expect(screen.getByText('metadata:')).toBeInTheDocument()

    // Should show collapsed indicators (multiple because both objects have 2 keys)
    expect(screen.getAllByText('2 keys')).toHaveLength(2)
  })

  test('renders arrays with collapsed state', () => {
    const arrayData = {
      items: ['apple', 'banana', 'cherry'],
      numbers: [1, 2, 3],
    }

    render(<JSONTree data={arrayData} />)

    expect(screen.getByText('items:')).toBeInTheDocument()
    expect(screen.getByText('numbers:')).toBeInTheDocument()

    // Should show array indicators (both arrays have 3 items)
    expect(screen.getAllByText('3 items')).toHaveLength(2)
  })

  test('handles null and undefined values', () => {
    const dataWithNulls = {
      nullValue: null,
      emptyString: '',
      zeroValue: 0,
    }

    render(<JSONTree data={dataWithNulls} />)

    expect(screen.getByText('nullValue:')).toBeInTheDocument()
    expect(screen.getByText('null')).toBeInTheDocument()
    expect(screen.getByText('emptyString:')).toBeInTheDocument()
    expect(screen.getByText('""')).toBeInTheDocument()
    expect(screen.getByText('zeroValue:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  test('applies custom postprocessValue function', () => {
    const postprocessValue = (value: any) => {
      if (typeof value === 'string' && value.includes('@')) {
        return '[EMAIL HIDDEN]'
      }

      return value
    }

    const dataWithEmail = {
      user: 'test@example.com',
      name: 'Test User',
    }

    render(<JSONTree data={dataWithEmail} postprocessValue={postprocessValue} />)

    // Should render property names
    expect(screen.getByText('user:')).toBeInTheDocument()
    expect(screen.getByText('name:')).toBeInTheDocument()

    // Email should be hidden by postprocessValue
    expect(screen.getByText('"[EMAIL HIDDEN]"')).toBeInTheDocument()
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()

    // Normal string should remain unchanged
    expect(screen.getByText('"Test User"')).toBeInTheDocument()
  })

  test('renders component successfully', () => {
    render(<JSONTree data={{}} />)

    // Should render without crashing
    const lists = screen.getAllByRole('list')
    expect(lists.length).toBeGreaterThan(0)
  })

  test('renders primitive values', () => {
    const primitiveData = 'just a string'
    render(<JSONTree data={primitiveData} />)

    expect(screen.getByText('"just a string"')).toBeInTheDocument()
  })
})
