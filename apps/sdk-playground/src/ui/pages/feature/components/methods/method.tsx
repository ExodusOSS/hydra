import { useState } from 'react'

import Text from '@/ui/components/text'
import Button from '@/ui/components/button'

import Argument from './argument.js'
import Value from '@/ui/components/value'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import Snippet from './snippet.js'

const { kebabCase } = lodash

const Method = ({ name, args = {}, doc, returnType, onSubmit }) => {
  const [state, setState] = useState<any[]>([])
  const [response, setResponse] = useState<any>()
  const [error, setError] = useState<string | null>(null)

  const argsRows = Object.entries(args)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setResponse(null)
    setError(null)

    try {
      const response = await onSubmit({ name, args: state })
      setResponse(response)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const hasResponse = response !== undefined || error

  return (
    <form
      id={kebabCase(name)}
      className="border-deep-50  mb-8 rounded-lg border"
      onSubmit={handleSubmit}
    >
      <div className="border-deep-50 bg-deep-300 border-b px-4 py-2">
        <Text>{name}</Text>
      </div>

      {doc?.summary && (
        <div className="px-4 py-2">
          <Text className="opacity-80" size={13}>
            {doc.summary}
          </Text>
        </div>
      )}

      {doc?.example && (
        <>
          <div className="bg-deep-400 px-4 py-2">
            <Text size={14} className="text-slate-500">
              Example
            </Text>
          </div>

          <div>
            <Snippet>{doc.example}</Snippet>
          </div>
        </>
      )}

      <div className="bg-deep-400 px-4 py-2">
        <Text size={14} className="text-slate-500">
          Arguments
        </Text>
      </div>

      <div className="flex flex-col p-4">
        {argsRows.length > 0 && (
          <div>
            {argsRows.map(([name, arg]: [string, any], i) => (
              <div key={name} className="mb-4 flex gap-4">
                <div className="min-w-32">
                  <Text size={13}>
                    {name}
                    {!arg.optional && <span className="text-red-700"> *</span>}
                  </Text>

                  <Text className="text-slate-500" size={12}>
                    {arg.type}
                  </Text>
                </div>

                <Argument
                  className="flex-1"
                  name={name}
                  argument={arg}
                  state={state[i]}
                  onChange={(v: any) => setState((prev) => Object.assign([], prev, { [i]: v }))}
                />
              </div>
            ))}
          </div>
        )}

        <Button className="self-end" type="submit" onClick={handleSubmit}>
          Submit
        </Button>
      </div>

      <div className="bg-deep-300 flex justify-between px-4 py-2">
        <Text size={14} className="text-slate-500">
          Response
        </Text>

        <Text className="text-slate-500" size={12}>
          {returnType}
        </Text>
      </div>

      {hasResponse && (
        <div className="p-4">
          <Text className="mb-4" size={13}>
            <span className="mr-2">Status:</span>

            {!error && response !== undefined && (
              <span className="mr-2 text-green-700">Success</span>
            )}

            {error && <span className="mr-2 text-red-700">Error</span>}
          </Text>

          {error ? (
            <Text className="mb-2" size={13}>
              <span className="mr-2">Message:</span>
              <span>{error}</span>
            </Text>
          ) : (
            <div className="mb-2">
              <Text as="span" className="mr-2" size={13}>
                Value:
              </Text>
              <Value value={response} />
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default Method
