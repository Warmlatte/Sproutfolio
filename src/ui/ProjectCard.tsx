/**
 * Project card (M6).
 *
 * A `Panel` surface presenting a project's thumbnail, title, description, and
 * tags. When `href` is set the whole card becomes an external link that opens in
 * a new tab with `rel="noopener"` (safe external navigation, per the project
 * security rules).
 */

import type { ReactNode } from 'react'
import { Panel } from './Panel'

export interface ProjectCardProps {
  title: string
  description: string
  tags?: ReadonlyArray<string>
  thumbnailUrl?: string
  href?: string
}

export function ProjectCard({ title, description, tags, thumbnailUrl, href }: ProjectCardProps) {
  const body: ReactNode = (
    <Panel padding="md" className="text-pixel-base">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
      ) : null}
      <h3 className="text-text" style={{ margin: '0 0 8px' }}>
        {title}
      </h3>
      <p className="text-pixel-sm text-text-muted" style={{ margin: 0 }}>
        {description}
      </p>
      {tags && tags.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            margin: '8px 0 0',
            padding: 0,
          }}
        >
          {tags.map((tag) => (
            <li key={tag} className="text-pixel-sm bg-surface-inset text-text px-2 py-1">
              {tag}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text no-underline"
        style={{ display: 'block' }}
      >
        {body}
      </a>
    )
  }

  return body
}
