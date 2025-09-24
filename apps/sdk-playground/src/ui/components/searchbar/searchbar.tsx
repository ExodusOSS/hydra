import Icon from '../icon/index.js'
import Kbd from '../kbd/index.js'

function Searchbar({ onSearchClick }) {
  return (
    <button
      className="border-deep-50 flex w-full cursor-pointer items-center gap-4 rounded-xl border p-2 text-slate-500"
      onClick={onSearchClick}
    >
      <Icon className="text-white" name="magnifying-glass" size={16} />
      <span className="flex-1 text-left text-base font-light">Search</span>
      <span className="flex gap-1">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  )
}

export default Searchbar
