import lodash from 'lodash'
import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'

import exodus from '@/ui/exodus'
import selectors from '@/ui/flux/selectors'
import { API_SPEC, DEFAULT_MNEMONIC, DEFAULT_PASSPHRASE, NAMESPACES } from '@/ui/constants/index.js'
import { useScrollReset } from '@/ui/hooks/use-scroll-reset'
import Routes from './routes.js'
import CommandMenu from './components/command-menu/index.js'
import DevTools from './components/dev-tools/index.js'
import SeedModal from './components/seed-modal/index.js'
import Sidebar from './components/sidebar/index.js'
import { Navbar } from './components/navbar/index.js'
import Footer from './components/footer/index.js'

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
  const scrollRef = useScrollReset<HTMLDivElement>()

  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const walletExists = useSelector(selectors.application.walletExists)

  useEffect(() => {
    if (!walletExists && !globalThis.__USE_DEFAULT_SEED__) setShowModal(true)
  }, [walletExists])

  const handleSearchClick = () => {
    setCommandMenuOpen(true)
  }

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen)
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
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <CommandMenu
        open={commandMenuOpen}
        onClick={handleCommandMenuClick}
        onOpenChange={setCommandMenuOpen}
      />

      <Navbar
        onSearchClick={handleSearchClick}
        onMenuToggle={handleMenuToggle}
        isSidebarOpen={sidebarOpen}
      />

      <div ref={scrollRef} className="flex-1 overflow-auto bg-background">
        <div className="flex min-h-full flex-col bg-background">
          <div className="relative flex flex-1">
            <div className="hidden md:block">
              <div className="sticky top-0 h-[calc(100vh-64px)]">
                <Sidebar sections={SIDEBAR} />
              </div>
            </div>

            {/* Mobile sidebar - overlay when open */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div
                  className="bg-background/80 absolute inset-0 backdrop-blur-sm"
                  onClick={handleMenuToggle}
                />
                <div className="relative">
                  <Sidebar sections={SIDEBAR} />
                </div>
              </div>
            )}

            <div className="flex-1 bg-background">
              <Routes />
            </div>
          </div>

          <Footer
            showTopBorder
            contactSection={{
              headlineProps: {
                title: 'Start Building Today',
                subtitle: 'Our sales team is available 24/7.',
              },
              buttonProps: {
                children: 'Contact Sales',
                onClick: () => window.open('https://www.exodus.com/contact/', '_blank', 'noopener'),
              },
            }}
            subscribeSection={null}
            NavMenu={undefined}
            socialLinkSection={{}}
            className="mt-8 bg-background text-neutral-300 md:mt-24"
          />
        </div>
      </div>

      <SeedModal onCancel={handleCancelModal} onConfirm={handleConfirmModal} visible={showModal} />

      <DevTools />
    </div>
  )
}

export default Root
