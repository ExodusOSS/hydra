import Input from '@/ui/components/input'
import Text from '@/ui/components/text'
import React, { useState } from 'react'
import Pill from '@/ui/components/pill'

const UnionArgument = ({ className, argument, state, onChange }) => {
  const { value: members } = argument

  const [activeMember, setActiveMember] = useState(members[0])
  const literalUnion = members.every((member) => member.type === 'literal')

  if (literalUnion) {
    return (
      <LiteralUnion className={className} argument={argument} state={state} onChange={onChange} />
    )
  }

  if (
    members.length === 2 &&
    members.every((member) => member.type === 'string' || member.type === 'number')
  ) {
    return (
      <Argument
        className={className}
        onChange={onChange}
        state={state}
        argument={{ ...argument, type: 'string' }}
      />
    )
  }

  return (
    <div className={className}>
      <div className="flex gap-2">
        {members.map((member, i) => (
          <Pill
            as="button"
            key={i}
            onClick={() => setActiveMember(member)}
            active={activeMember === member}
          >
            #{i}
          </Pill>
        ))}
      </div>

      <Argument className="mt-4" argument={activeMember} state={state} onChange={onChange} />
    </div>
  )
}

const LiteralUnion = ({ className, argument, state, onChange }) => {
  const { value: members } = argument

  return (
    <div className={className}>
      <div className="flex gap-2">
        {members.map((member, i) => (
          <Pill
            as="button"
            key={i}
            onClick={() => onChange(member.const)}
            active={state === member.const}
          >
            {member.const}
          </Pill>
        ))}
      </div>
    </div>
  )
}

const Argument = ({ className, argument, state, onChange }) => {
  const { type, value, optional, doc } = argument

  if (type === 'string' || type === 'any') {
    return (
      <Input
        type="text"
        value={state || ''}
        placeholder={doc?.sample}
        required={!optional}
        className={className}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (type === 'boolean') {
    return (
      <div>
        <Input
          type="checkbox"
          value={state || false}
          placeholder={doc?.sample}
          className={className}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
    )
  }

  if (type === 'number') {
    return (
      <Input
        type="number"
        value={state || 0}
        required={!optional}
        placeholder={doc?.sample}
        className={className}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    )
  }

  if (type === 'array') {
    return (
      <Input
        type="text"
        value={state || ''}
        required={!optional}
        className={className}
        onChange={(e) => onChange(e.target.value.split(','))}
      />
    )
  }

  if (type === 'object') {
    return (
      <div className={className}>
        {Object.entries<any>(value)
          .filter(([, it]) => it.type !== 'function')
          .map(([name, subValue]) => {
            return (
              <div key={name} className="mb-4 flex gap-4">
                <div className="min-w-32">
                  <Text size={13}>
                    {name}
                    {!subValue.optional && <span className="text-red-500"> *</span>}
                  </Text>

                  <Text className="opacity-60" size={12}>
                    {subValue.type}
                  </Text>
                </div>

                <Argument
                  className="flex-1"
                  argument={subValue}
                  state={state?.[name]}
                  onChange={(v: any) => onChange({ ...state, [name]: v })}
                />
              </div>
            )
          })}
      </div>
    )
  }

  if (type === 'union') {
    return (
      <UnionArgument className={className} argument={argument} state={state} onChange={onChange} />
    )
  }

  return null
}

export default Argument
