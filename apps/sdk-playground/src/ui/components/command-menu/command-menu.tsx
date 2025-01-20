import { Command } from 'cmdk'
import { useEffect } from 'react'
import CommandItem from './command-item.js'
import selectors from '@/ui/flux/selectors'
import { API_SPEC, NAMESPACES } from '@/ui/constants/index.js'

const COMMAND_MENU = [
  {
    title: 'Features',
    items: NAMESPACES.map((namespace: string) => ({
      id: namespace,
      type: 'feature',
      name: namespace,
    })),
  },
  {
    title: 'Methods',
    items: NAMESPACES.flatMap((namespace: string) =>
      Object.keys(API_SPEC[namespace]?.value || {}).map((method) => ({
        id: `${namespace}.${method}`,
        type: 'method',
        name: method,
        feature: namespace,
      }))
    ),
  },
  {
    title: 'Selectors',
    items: Object.entries(selectors).flatMap(([namespace, selectors]: [string, any]) =>
      Object.keys(selectors).map((name) => ({
        id: `${namespace}.${name}`,
        type: 'selector',
        name,
        feature: namespace,
      }))
    ),
  },
]

const CommandMenu = ({ open, onClick, onOpenChange }) => {
  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange((open) => !open)
      }
    }

    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  return (
    <Command.Dialog className="drop-shadow-lg" open={open} onOpenChange={onOpenChange}>
      <Command.Input placeholder="Search..." />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {COMMAND_MENU.map((group) => (
          <Command.Group key={group.title} heading={group.title}>
            {group.items.map((item) => (
              <CommandItem
                key={item.id}
                {...item}
                onClick={() => {
                  onClick(item)
                  onOpenChange(false)
                }}
              />
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  )
}

export default CommandMenu
