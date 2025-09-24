import clsx from 'clsx'
import { XoResponsiveBrand } from '../xo/index.js'

interface NavbarProps {
  onSearchClick: () => void
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export const Navbar = ({ onSearchClick, onMenuToggle, isSidebarOpen }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-background print:hidden">
      <div className="border-border/40 absolute -z-10 size-full border-b bg-background" />
      <nav
        className="mx-auto flex max-w-full items-center justify-between gap-4 px-6 py-4"
        style={{ height: '64px' }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <XoResponsiveBrand />
        </div>

        {/* Desktop: Search button */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={onSearchClick}
            className="border-border/40 hover:bg-muted/80 flex min-w-[280px] items-center justify-between gap-3 rounded-md border bg-muted px-4 py-2.5 text-sm text-muted-foreground transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L16.514 16.506M19 10.5A8.5 8.5 0 1 1 10.5 2A8.5 8.5 0 0 1 19 10.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Search...
            </div>
            <span className="font-mono text-xs opacity-60">⌘K</span>
          </button>
        </div>

        {/* Mobile: Hamburger menu */}
        <div className="flex md:hidden">
          <button
            onClick={onMenuToggle}
            aria-label="Menu"
            className="hover:bg-muted/50 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={clsx('transition-transform duration-200', isSidebarOpen && 'rotate-90')}
            >
              <path
                d="M4 6H20M4 12H20M4 18H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
