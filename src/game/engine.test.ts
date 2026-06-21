import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pixiMock = vi.hoisted(() => ({
  appInstances: [] as MockApplication[],
}))

const textureMock = vi.hoisted(() => ({
  loadTextureAtlas: vi.fn(),
}))

const farmSceneMock = vi.hoisted(() => ({
  buildFarmScene: vi.fn(),
}))

interface MockNode {
  readonly tagName: string
  readonly style: { cssText: string }
  readonly attributes: Record<string, string>
  textContent: string
  parentNode: MockNode | null
  children: MockNode[]
  setAttribute(name: string, value: string): void
  appendChild(child: MockNode): MockNode
  replaceChildren(...children: MockNode[]): void
}

interface MockApplication {
  readonly canvas: MockNode
  readonly screen: { width: number; height: number }
  readonly stage: { addChild: ReturnType<typeof vi.fn> }
  readonly destroy: ReturnType<typeof vi.fn>
  init(options: { resizeTo: { clientWidth: number; clientHeight: number } }): Promise<void>
}

function makeNode(tagName: string): MockNode {
  return {
    tagName,
    style: { cssText: '' },
    attributes: {},
    textContent: '',
    parentNode: null,
    children: [],
    setAttribute(name: string, value: string): void {
      this.attributes[name] = value
    },
    appendChild(child: MockNode): MockNode {
      child.parentNode = this
      this.children.push(child)
      return child
    },
    replaceChildren(...children: MockNode[]): void {
      for (const child of this.children) {
        child.parentNode = null
      }
      this.children = []
      for (const child of children) {
        this.appendChild(child)
      }
    },
  }
}

function makeContainer(): HTMLElement {
  const node = makeNode('div') as MockNode & {
    clientWidth: number
    clientHeight: number
  }
  node.clientWidth = 320
  node.clientHeight = 240
  return node as unknown as HTMLElement
}

async function flushAsync(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

vi.mock('pixi.js', () => {
  class Application implements MockApplication {
    readonly canvas = makeNode('canvas')
    readonly screen = { width: 0, height: 0 }
    readonly stage = { addChild: vi.fn() }
    readonly destroy = vi.fn(() => {
      const parent = this.canvas.parentNode
      if (parent) {
        parent.children = parent.children.filter((child) => child !== this.canvas)
        this.canvas.parentNode = null
      }
    })

    async init(options: {
      resizeTo: { clientWidth: number; clientHeight: number }
    }): Promise<void> {
      this.screen.width = options.resizeTo.clientWidth
      this.screen.height = options.resizeTo.clientHeight
      pixiMock.appInstances.push(this)
    }
  }

  class Container {
    readonly scale = { set: vi.fn() }
    readonly position = { set: vi.fn() }
  }

  return { Application, Container }
})

vi.mock('./textures', () => ({
  loadTextureAtlas: textureMock.loadTextureAtlas,
}))

vi.mock('./scenes/farm', () => ({
  buildFarmScene: farmSceneMock.buildFarmScene,
}))

describe('createEngine', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: vi.fn((tagName: string) => makeNode(tagName)),
    })
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    pixiMock.appInstances.length = 0
    textureMock.loadTextureAtlas.mockReset()
    farmSceneMock.buildFarmScene.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('destroys the Pixi app and leaves only a visible error when texture loading fails', async () => {
    textureMock.loadTextureAtlas.mockRejectedValueOnce(new Error('missing sheet'))
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    createEngine(container)
    await flushAsync()

    expect(pixiMock.appInstances[0]?.destroy).toHaveBeenCalledWith(true, {
      children: true,
    })
    expect([...container.children].map((child) => child.tagName)).toEqual(['div'])
    expect(
      (container.children[0] as unknown as MockNode).attributes['data-engine-error'],
    ).toBe('true')
  })

  it('destroys an atlas that resolves after the engine handle is destroyed', async () => {
    let resolveAtlas: (atlas: { destroy: () => void }) => void = () => {}
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveAtlas = resolve
      }),
    )
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    const engine = createEngine(container)
    await flushAsync()
    engine.destroy()
    resolveAtlas(atlas)
    await flushAsync()

    expect(atlas.destroy).toHaveBeenCalledTimes(1)
  })
})
