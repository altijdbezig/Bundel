/**
 * Lijniconen volgens de kit: 24px grid, 1.75px streek, ronde uiteinden,
 * geen vulling, hoeken 2px afgerond. Eén icoon per rij.
 */
function Icon({ size = 26, children, title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block' }}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}

export const IconToday = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
)

export const IconTasks = (p) => (
  <Icon {...p}>
    <rect x="4" y="3.5" width="16" height="17" rx="2" />
    <path d="M8.5 9.5l2 2 4-4M8.5 15.5h7" />
  </Icon>
)

export const IconCalendar = (p) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
  </Icon>
)

export const IconGrades = (p) => (
  <Icon {...p}>
    <path d="M4 19.5V13M9.3 19.5V8.5M14.7 19.5v-6M20 19.5V5" />
  </Icon>
)

export const IconGroups = (p) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3.4" />
    <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M15.5 6.2a3.4 3.4 0 0 1 0 6.4M17 14.9c2.1.6 3.5 2.4 3.5 4.6" />
  </Icon>
)

export const IconSources = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="6" r="2.6" />
    <circle cx="5.5" cy="18" r="2.6" />
    <circle cx="18.5" cy="18" r="2.6" />
    <path d="M10.2 7.9L7 15.6M13.8 7.9L17 15.6M8.1 18h7.8" />
  </Icon>
)

export const IconShield = (p) => (
  <Icon {...p}>
    <path d="M12 3.5l7 2.6v5.3c0 4.2-2.8 7.6-7 9.1-4.2-1.5-7-4.9-7-9.1V6.1l7-2.6z" />
    <path d="M9.2 12.2l2 2 3.6-3.9" />
  </Icon>
)

export const IconLock = (p) => (
  <Icon {...p}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
)

export const IconUnlink = (p) => (
  <Icon {...p}>
    <path d="M9.5 14.5l-2 2a3.9 3.9 0 0 1-5.5-5.5l2-2M14.5 9.5l2-2a3.9 3.9 0 0 1 5.5 5.5l-2 2" />
    <path d="M9 4.5v2M4.5 9h2M15 19.5v-2M19.5 15h-2" />
  </Icon>
)

export const IconMonitor = (p) => (
  <Icon {...p}>
    <rect x="2.5" y="4" width="19" height="12.5" rx="2" />
    <path d="M8.5 20.5h7M12 16.5v4" />
  </Icon>
)

export const IconPhone = (p) => (
  <Icon {...p}>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </Icon>
)

export const IconGlobe = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5z" />
  </Icon>
)

export const IconDownload = (p) => (
  <Icon {...p}>
    <path d="M12 3.5v11M7.8 10.5L12 14.7l4.2-4.2" />
    <path d="M4.5 17v2a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
  </Icon>
)

export const IconArrow = (p) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
)

export const IconChevron = (p) => (
  <Icon {...p}>
    <path d="M7 10l5 5 5-5" />
  </Icon>
)

export const IconWindows = (p) => (
  <Icon {...p}>
    <path d="M3.5 6.4l7-1v6.1h-7zM12.5 5.1l8-1.1v7.5h-8zM3.5 12.5h7v6.1l-7-1zM12.5 12.5h8V20l-8-1.1z" />
  </Icon>
)

export const IconApple = (p) => (
  <Icon {...p}>
    <path d="M15.6 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.6-.9.9-1.7 1-1.8-.1 0-2.2-.9-2.2-3.4z" />
    <path d="M13.4 5.4c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3z" />
  </Icon>
)

export const IconPlay = (p) => (
  <Icon {...p}>
    <path d="M4.5 3.2v17.6c0 .8.9 1.3 1.6.9l13.4-8.8c.6-.4.6-1.4 0-1.8L6.1 2.3c-.7-.4-1.6.1-1.6.9z" />
    <path d="M4.9 3l10.6 10.4M4.9 21L15.5 10.6" />
  </Icon>
)

export const IconBell = (p) => (
  <Icon {...p}>
    <path d="M18 9.5a6 6 0 0 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5z" />
    <path d="M10.3 19.5a2 2 0 0 0 3.4 0" />
  </Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M15.8 15.8l4 4" />
  </Icon>
)

export const IconSettings = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 13h-.2a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 6.2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1v-.2a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.8 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.1z" />
  </Icon>
)

export const IconPlug = (p) => (
  <Icon {...p}>
    <path d="M9 3.5v5M15 3.5v5" />
    <path d="M6 8.5h12v3a6 6 0 0 1-12 0z" />
    <path d="M12 17.5v3" />
  </Icon>
)

export const IconClose = (p) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const IconInbox = (p) => (
  <Icon {...p}>
    <path d="M3.5 13.5h4l1.5 2.5h6l1.5-2.5h4" />
    <path d="M5.5 4.5h13l2 9v5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5v-5z" />
  </Icon>
)

export const IconLogout = (p) => (
  <Icon {...p}>
    <path d="M14.5 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-3.5" />
    <path d="M10 8.5L6 12l4 3.5M6 12h9" />
  </Icon>
)

export const IconPresence = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M8.4 12.2l2.4 2.4 4.8-5" />
  </Icon>
)

export const IconMicrosoft = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} aria-hidden="true" focusable="false">
    <rect x="2.5" y="2.5" width="8.5" height="8.5" fill="#F25022" />
    <rect x="13" y="2.5" width="8.5" height="8.5" fill="#7FBA00" />
    <rect x="2.5" y="13" width="8.5" height="8.5" fill="#00A4EF" />
    <rect x="13" y="13" width="8.5" height="8.5" fill="#FFB900" />
  </svg>
)

export default Icon
