import type { ReactElement } from 'react'

export type ContactProps = {
  buttonProps?: {
    children?: React.ReactNode
    handleClick?: () => void
    href?: string
  } | null
  headlineProps?: {
    title?: ReactElement | string
    subtitle?: string
  } | null
}

export function Contact({ headlineProps, buttonProps }: ContactProps) {
  return (
    <div className="flex flex-col items-start gap-y-4 md:gap-y-6">
      {(headlineProps?.title || headlineProps?.subtitle) && (
        <div className="flex flex-col">
          {!!headlineProps.title && <h3 className="text-3xl font-normal">{headlineProps.title}</h3>}
          {!!headlineProps.subtitle && (
            <span className="text-sm tracking-wide opacity-32">{headlineProps.subtitle}</span>
          )}
        </div>
      )}
      {!!buttonProps?.children && (
        <button
          onClick={buttonProps.handleClick}
          className="inline-flex h-12 items-center rounded-3xl bg-white pl-2 pr-6 text-base font-medium text-black transition-colors hover:bg-gray-100"
        >
          <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-black p-1.5 text-white">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
          {buttonProps.children}
        </button>
      )}
    </div>
  )
}
