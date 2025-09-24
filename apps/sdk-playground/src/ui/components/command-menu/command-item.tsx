import { Command } from 'cmdk'
import Icon from '@/ui/components/icon'

const COMMAND_ICONS = {
  feature: 'block',
  method: 'function',
  selector: 'selector',
}

type Props = {
  type: string
  name: string
  onClick: () => void
  feature?: string
}

const CommandItem = (props: Props) => {
  const { type, name, feature, onClick } = props

  return (
    <Command.Item className="flex gap-2" onSelect={onClick}>
      {COMMAND_ICONS[type] && <Icon className="text-white opacity-30" name={COMMAND_ICONS[type]} />}
      <span className="flex-1 truncate ">{name}</span>
      {feature && <span className="bg-deep-100 rounded px-2 py-1 text-xs">{feature}</span>}
    </Command.Item>
  )
}

export default CommandItem
