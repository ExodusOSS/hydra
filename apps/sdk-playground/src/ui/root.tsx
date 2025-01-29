import lodash from 'lodash'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

import exodus from '@/ui/exodus'
import selectors from '@/ui/flux/selectors'
import { API_SPEC, DEFAULT_MNEMONIC, DEFAULT_PASSPHRASE, NAMESPACES } from '@/ui/constants/index.js'
import Routes from './routes.js'
import CommandMenu from './components/command-menu/index.js'
import DevTools from './components/dev-tools/index.js'
import SeedModal from './components/seed-modal/index.js'
import Sidebar from './components/sidebar/index.js'

const { kebabCase } = lodash

const SIDEBAR = [
  {
    title: 'API Namespaces',
    items: NAMESPACES.map((namespace: string) => ({
      name: namespace,
      href: `/features/${kebabCase(namespace)}`,
      incomplete: !API_SPEC[namespace],
    })),
  },
]

const Root = () => {
  const [, setLocation] = useLocation()

  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const walletExists = useSelector(selectors.application.walletExists)

  useEffect(() => {
    if (!walletExists && !globalThis.__USE_DEFAULT_SEED__) setShowModal(true)
  }, [walletExists])

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

  const handleCancelModal = () => {
    setShowModal(false)
  }

  const handleConfirmModal = async () => {
    setShowModal(false)
    await exodus.application.import({ mnemonic: DEFAULT_MNEMONIC, passphrase: DEFAULT_PASSPHRASE })
    await exodus.application.unlock({ passphrase: DEFAULT_PASSPHRASE })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <CommandMenu
        open={commandMenuOpen}
        onClick={handleCommandMenuClick}
        onOpenChange={setCommandMenuOpen}
      />

      <div className="relative flex h-screen w-full flex-auto overflow-hidden">
        <Sidebar sections={SIDEBAR} onSearchClick={handleSearchClick} />

        <div className="flex-1 overflow-auto">
          <Routes />
        </div>
      </div>

      <SeedModal onCancel={handleCancelModal} onConfirm={handleConfirmModal} visible={showModal} />

      <DevTools />
    </div>
  )
}

export default Root
