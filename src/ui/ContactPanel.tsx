/**
 * Contact panel (M6).
 *
 * A `Panel` listing contact links, each row pairing a `PixelIcon` with a label.
 * Every link opens in a new tab with `rel="noopener"` and uses the `--link`
 * semantic token color.
 */

import { Panel } from './Panel'
import { PixelIcon } from './primitives/PixelIcon'

export interface ContactLink {
  iconIndex: number
  label: string
  href: string
}

export interface ContactPanelProps {
  links: ReadonlyArray<ContactLink>
}

export function ContactPanel({ links }: ContactPanelProps) {
  return (
    <Panel padding="md">
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link no-underline text-pixel-base"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <PixelIcon index={link.iconIndex} label={link.label} />
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
