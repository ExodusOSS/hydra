import { cn } from '@/ui/utils/classnames'

const Button = ({ className, type, onClick, children }) => {
  return (
    <button
      className={cn('rounded bg-primary px-4 py-2 text-sm text-white', className)}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button
