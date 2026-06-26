/**
 * Dev-only UI component gallery (M6).
 *
 * Previews every `src/ui/` component in its various states so the Sprout Lands
 * design system can be checked visually and synced to Claude Design (P2). Mounted
 * only behind the `#ui` dev gate in App.tsx; never part of production output
 * (the same `import.meta.env.DEV` lazy pattern as the `#sprites` viewer).
 *
 * Sections are appended by later tasks (NineSlice, PixelIcon, Panel, …) using the
 * reusable `GallerySection` wrapper exported here.
 */

import { useState } from 'react'
import type { ReactNode } from 'react'
import { catalog } from '../../game/sprites/catalog'
import { NineSlice } from '../primitives/NineSlice'
import { PixelIcon } from '../primitives/PixelIcon'
import { Panel } from '../Panel'
import { PixelButton } from '../PixelButton'
import { DialogBox } from '../DialogBox'
import { InventoryGrid } from '../InventoryGrid'
import { ProjectCard } from '../ProjectCard'
import { ContactPanel } from '../ContactPanel'

const dialog = catalog.dialogBox

/** Remounts the DialogBox on advance so the typewriter/skip flow can be replayed. */
function DialogBoxDemo() {
  const [round, setRound] = useState(0)
  return (
    <div style={{ width: 360 }}>
      <DialogBox
        key={round}
        speakerName="Sprout"
        text="點擊一次可跳到全文，完成後再點一次會觸發 onAdvance（這裡會重播）。"
        onAdvance={() => setRound((r) => r + 1)}
      />
      <p className="text-pixel-sm text-text-muted" style={{ marginTop: 8 }}>
        advance count: {round}
      </p>
    </div>
  )
}

/** Owns selectedIndex on the caller side, as InventoryGrid is presentational. */
function InventoryDemo() {
  const [selected, setSelected] = useState<number | undefined>(2)
  const items = [
    { iconIndex: 0, label: 'item 0' },
    { iconIndex: 1, label: 'item 1' },
    null,
    { iconIndex: 18, label: 'item 18' },
    null,
    { iconIndex: 5, label: 'item 5' },
  ]
  return (
    <div>
      <InventoryGrid
        items={items}
        columns={3}
        selectedIndex={selected}
        onSelect={(index) => {
          console.log('select', index)
          setSelected(index)
        }}
      />
      <p className="text-pixel-sm text-text-muted" style={{ marginTop: 8 }}>
        selected: {selected ?? 'none'}
      </p>
    </div>
  )
}

interface GallerySectionProps {
  title: string
  note?: string
  children: ReactNode
}

/** A titled gallery block: heading, optional note, then the preview content. */
export function GallerySection({ title, note, children }: GallerySectionProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 className="font-decorative text-pixel-lg">{title}</h2>
      {note ? (
        <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 12 }}>
          {note}
        </p>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
        {children}
      </div>
    </section>
  )
}

export function UIGallery() {
  return (
    <main className="bg-surface text-text" style={{ minHeight: '100vh', padding: 32 }}>
      <h1 className="font-decorative text-pixel-xl">UI component gallery</h1>
      <p className="text-pixel-sm text-text-muted" style={{ marginBottom: 32 }}>
        Dev-only preview (#ui). Sprout Lands design system — verify each component
        and state, and that 9-slice surfaces scale without breaking.
      </p>

      <GallerySection
        title="NineSlice"
        note="Shared border-image surface. Corners stay fixed; edges/center stretch with content. Scale 2 and 3."
      >
        <NineSlice
          asset={dialog.src}
          slice={dialog.border}
          scale={2}
          className="text-pixel-base p-4"
        >
          <span style={{ display: 'block', width: 160 }}>
            scale 2 — children sit in the center; the wooden frame surrounds them.
          </span>
        </NineSlice>
        <NineSlice
          asset={dialog.src}
          slice={dialog.border}
          scale={3}
          className="text-pixel-base p-4"
        >
          <span style={{ display: 'block', width: 220 }}>
            scale 3 — taller content stretches the edges while corners stay crisp.
          </span>
        </NineSlice>
      </GallerySection>

      <GallerySection
        title="PixelIcon"
        note="Single 16px cell from iconsAll. index 1 is one column right of 0; index 18 is the first cell of row two."
      >
        <span className="text-pixel-base" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <PixelIcon index={0} scale={3} label="icon 0" />
          <PixelIcon index={1} scale={3} label="icon 1" />
          <PixelIcon index={18} scale={3} label="icon 18" />
        </span>
        <p className="text-pixel-base">
          inline in text <PixelIcon index={5} label="heart" /> the icon keeps the
          baseline.
        </p>
      </GallerySection>

      <GallerySection
        title="Panel"
        note="Wooden container. Padding sm/md/lg → 8/16/24px; content never touches the border art."
      >
        <Panel padding="sm" className="text-pixel-base">
          <span style={{ display: 'block', width: 140 }}>padding sm — 8px</span>
        </Panel>
        <Panel padding="md" className="text-pixel-base">
          <span style={{ display: 'block', width: 140 }}>padding md — 16px</span>
        </Panel>
        <Panel padding="lg" className="text-pixel-base">
          <span style={{ display: 'block', width: 140 }}>padding lg — 24px</span>
        </Panel>
      </GallerySection>

      <GallerySection
        title="PixelButton"
        note="Hover changes the face tint; pressing nudges 1px; disabled is dimmed and unclickable. With and without a leading icon."
      >
        <PixelButton variant="primary" onClick={() => console.log('primary')}>
          Primary
        </PixelButton>
        <PixelButton variant="secondary" onClick={() => console.log('secondary')}>
          Secondary
        </PixelButton>
        <PixelButton
          variant="primary"
          iconIndex={5}
          onClick={() => console.log('with icon')}
        >
          With icon
        </PixelButton>
        <PixelButton variant="primary" disabled onClick={() => console.log('nope')}>
          Disabled
        </PixelButton>
      </GallerySection>

      <GallerySection
        title="DialogBox"
        note="Text types out with a blinking cursor. Click to skip to the end; click again to advance. reduced-motion shows it all at once."
      >
        <DialogBoxDemo />
      </GallerySection>

      <GallerySection
        title="InventoryGrid"
        note="Presentational: filled cells overlay an icon, null cells show the slot only. The outlined cell is selectedIndex (caller-owned); clicking logs the index."
      >
        <InventoryDemo />
      </GallerySection>

      <GallerySection
        title="ProjectCard"
        note="Panel-based. The card with an href is a whole-card external link (new tab, rel=noopener); the other has no link."
      >
        <div style={{ width: 240 }}>
          <ProjectCard
            title="Sproutfolio"
            description="可走動探索的像素農場個人網站。"
            tags={['React', 'Pixi.js', 'TypeScript']}
            href="https://github.com/Warmlatte/sproutfolio"
          />
        </div>
        <div style={{ width: 240 }}>
          <ProjectCard
            title="No link card"
            description="沒有 href，整卡不是連結，只是純展示。"
            tags={['demo']}
          />
        </div>
      </GallerySection>

      <GallerySection
        title="ContactPanel"
        note="Icon + label rows in --link color; each opens in a new tab with rel=noopener."
      >
        <div style={{ width: 260 }}>
          <ContactPanel
            links={[
              { iconIndex: 0, label: 'GitHub', href: 'https://github.com/Warmlatte' },
              { iconIndex: 1, label: 'Email', href: 'mailto:w0975582420@gmail.com' },
              { iconIndex: 5, label: 'Itch.io', href: 'https://cupnooble.itch.io' },
            ]}
          />
        </div>
      </GallerySection>
    </main>
  )
}
