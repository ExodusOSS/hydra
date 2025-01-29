interface LogoSvgProps {
  size: number
  className?: string
  style?: React.CSSProperties
}

function LogoSvg({ size, className, style }: LogoSvgProps) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      viewBox="0 0 300 300"
    >
      <path
        fill="url(#paint0_linear_1661_295)"
        d="M298.203 83.765 170.449 0v46.833l81.956 53.256-9.642 30.509h-72.314v38.804h72.314l9.642 30.509-81.956 53.256V300l127.754-83.497-20.89-66.369z"
      />
      <path
        fill="url(#paint1_linear_1661_295)"
        d="M59.3 169.402h72.046v-38.804H59.033l-9.374-30.509 81.687-53.256V0L3.593 83.765l20.89 66.369-20.89 66.369L131.614 300v-46.833l-81.955-53.256z"
      />
      <mask
        id="mask0_1661_295"
        width="296"
        height="300"
        x="3"
        y="0"
        maskUnits="userSpaceOnUse"
        style={{ maskType: 'alpha' }}
      >
        <path
          fill="url(#paint2_linear_1661_295)"
          d="M298.204 83.765 170.45 0v46.833l81.955 53.256-9.642 30.509H170.45v38.804h72.313l9.642 30.509-81.955 53.256V300l127.754-83.497-20.891-66.369z"
        />
        <path
          fill="url(#paint3_linear_1661_295)"
          d="M59.301 169.402h72.046v-38.804H59.033l-9.374-30.509 81.688-53.256V0L3.593 83.765l20.89 66.369-20.89 66.369L131.615 300v-46.833l-81.956-53.256z"
        />
      </mask>
      <g mask="url(#mask0_1661_295)">
        <path fill="url(#paint4_linear_1661_295)" d="M3.75 0h292.5v300H3.75z" />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_1661_295"
          x1="256.875"
          x2="171.3"
          y1="320.625"
          y2="-32.946"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B46F9" />
          <stop offset="1" stopColor="#BBFBE0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1661_295"
          x1="256.875"
          x2="171.3"
          y1="320.625"
          y2="-32.946"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B46F9" />
          <stop offset="1" stopColor="#BBFBE0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1661_295"
          x1="256.875"
          x2="171.3"
          y1="320.625"
          y2="-32.946"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B46F9" />
          <stop offset="1" stopColor="#BBFBE0" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1661_295"
          x1="256.875"
          x2="171.3"
          y1="320.625"
          y2="-32.946"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0B46F9" />
          <stop offset="1" stopColor="#BBFBE0" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1661_295"
          x1="22.5"
          x2="170.625"
          y1="67.5"
          y2="178.125"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.12" stopColor="#8952FF" stopOpacity="0.87" />
          <stop offset="1" stopColor="#DABDFF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ExodusLogo({ size = 100, withShadow }) {
  return (
    <div className="relative">
      <LogoSvg size={size} />
      {withShadow && (
        <LogoSvg
          size={size * 2}
          className="absolute opacity-80 blur-xl"
          style={{ top: -size / 2, left: -size / 2 }}
        />
      )}
    </div>
  )
}

export default ExodusLogo
