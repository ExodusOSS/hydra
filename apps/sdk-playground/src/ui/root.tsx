import Header from '@/ui/components/header'
import { useState } from 'react'
import CommandMenu from './components/command-menu/index.js'
import Routes from './routes.js'
import { useLocation } from 'wouter'
import lodash from 'lodash'

const { kebabCase } = lodash

const Root = () => {
  const [, setLocation] = useLocation()

  const [commandMenuOpen, setCommandMenuOpen] = useState(false)

  const handleSearchClick = () => {
    setCommandMenuOpen(true)
  }

  const handleCommandMenuClick = (value) => {
    const featureRoute = value.type === 'feature' ? value.name : value.feature
    const anchorRoute = value.type === 'feature' ? '' : value.name

    setLocation(
      '/features/' + kebabCase(featureRoute) + (anchorRoute ? '#' + kebabCase(anchorRoute) : '')
    )
  }

  return (
    <div className="flex min-h-full flex-col bg-white">
      <Header onSearchClick={handleSearchClick} />

      <CommandMenu
        open={commandMenuOpen}
        onClick={handleCommandMenuClick}
        onOpenChange={setCommandMenuOpen}
      />

      <div className="max-w-8xl relative mx-auto flex w-full flex-auto px-8">
        <Routes />
      </div>
    </div>
  )
}

export default Root
