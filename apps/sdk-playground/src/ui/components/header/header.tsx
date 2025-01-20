import Logo from '../logo/index.js'

const Header = ({ onSearchClick }) => {
  return (
    <header className="sticky top-0 z-50 flex w-full flex-none flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 sm:px-6 lg:px-8">
      <div className="relative flex flex-grow basis-0 items-center">
        <a aria-label="Home page" href="/">
          <Logo />
        </a>
      </div>

      <button
        className="flex w-64 cursor-pointer items-center justify-between rounded bg-slate-200 px-4 py-2 text-slate-500"
        onClick={onSearchClick}
      >
        <span>Search...</span>
        <span className="flex gap-1">
          <kbd className="size-5 rounded bg-slate-400 text-sm text-slate-600">⌘</kbd>
          <kbd className="size-5 rounded bg-slate-400 text-sm text-slate-600">K</kbd>
        </span>
      </button>
    </header>
  )
}

export default Header
