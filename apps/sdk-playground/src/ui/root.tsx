import Header from '@/ui/components/header'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CommandMenu from './components/command-menu/index.js'
import Routes from './routes.js'
import { useLocation } from 'wouter'
import lodash from 'lodash'
import exodus from '@/ui/exodus'
import selectors from '@/ui/flux/selectors'

const { kebabCase } = lodash

// also used in integration tests
const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
const passphrase = 'abracadabra'

const Root = () => {
  const [, setLocation] = useLocation()

  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const walletExists = useSelector(selectors.application.walletExists)

  useEffect(() => {
    if (!walletExists) setShowModal(true)
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

      {showModal ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Use default seed?</h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowModal(false)
                }}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  console.log('Default seed selected')
                  setShowModal(false)
                  await exodus.application.import({ mnemonic, passphrase })
                  await exodus.application.unlock({ passphrase })
                }}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Root
