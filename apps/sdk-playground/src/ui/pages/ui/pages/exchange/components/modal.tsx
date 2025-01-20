interface ModalProps {
  title?: string
  options?: { value: any; label: string }[]
  onClick?: (option: any) => void
}

const Modal = ({ title, options, onClick }: ModalProps) => {
  if (!options) return null

  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-black/50"
      onClick={() => onClick?.(null)}
    >
      <div className="flex max-h-96 w-[80%] flex-col rounded-md bg-[#282a44] p-4 text-white shadow-sm">
        <p className="mb-4 border-b border-b-slate-700 pb-2 text-center">{title}</p>

        <div className="flex-1  overflow-scroll">
          {options.map((option) => (
            <button
              className="mb-2 block"
              key={option.label}
              onClick={(e) => {
                e.stopPropagation()
                onClick?.(option.value)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Modal
