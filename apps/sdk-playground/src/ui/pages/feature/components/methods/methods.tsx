import Method from './method.js'

function Methods({ namespace, methods, onSubmit }) {
  const handleSubmit = async (data: { name: string; args: any }) => {
    return onSubmit({ namespace, ...data })
  }

  return (
    <div>
      {methods.length === 0 && <p>No methods available</p>}

      {methods.map(([name, method]: [string, any]) => (
        <Method
          doc={method.doc}
          key={name}
          name={name}
          args={method.args}
          returnType={method.returnType}
          onSubmit={handleSubmit}
        />
      ))}
    </div>
  )
}

export default Methods
