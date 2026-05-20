function IconBase({ children, ...props }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeNavIcon(props) {
  return (
    <IconBase strokeWidth={1.9} {...props}>
      <path d="M4.5 10.5 12 4.2l7.5 6.3V19a1.5 1.5 0 0 1-1.5 1.5h-12A1.5 1.5 0 0 1 4.5 19z" />
      <path d="M9.4 20.5v-6.3a1 1 0 0 1 1-1h3.2a1 1 0 0 1 1 1v6.3" />
    </IconBase>
  );
}

export function ToolsNavIcon(props) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <rect width="6.9" height="6.9" x="3.8" y="3.8" rx="1.9" />
      <rect width="6.9" height="6.9" x="13.3" y="3.8" rx="1.9" />
      <rect width="6.9" height="6.9" x="3.8" y="13.3" rx="1.9" />
      <rect width="6.9" height="6.9" x="13.3" y="13.3" rx="1.9" />
    </IconBase>
  );
}

export function FavoriteNavIcon(props) {
  return (
    <IconBase strokeWidth={1.9} {...props}>
      <path d="M12 20.2s-6.9-4.1-8.4-7.7C2.5 9.8 4 7 7.1 7c1.9 0 3.2 1 4.2 2.4C12.3 8 13.6 7 15.5 7c3 0 4.6 2.8 3.5 5.5-1.4 3.6-7 7.7-7 7.7Z" />
      <path d="m16.8 4.6.5 1.1 1.1.5-1.1.5-.5 1.1-.5-1.1-1.1-.5 1.1-.5z" />
    </IconBase>
  );
}

export function MoonIcon(props) {
  return (
    <IconBase strokeWidth={1.9} {...props}>
      <path d="M15.8 3.9a8.8 8.8 0 1 0 4.3 14.7A8.5 8.5 0 0 1 15.8 3.9Z" />
      <circle cx="17.8" cy="6.2" r="0.9" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function SunIcon(props) {
  return (
    <IconBase strokeWidth={1.9} {...props}>
      <circle cx="12" cy="12" r="3.7" />
      <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9" />
    </IconBase>
  );
}
