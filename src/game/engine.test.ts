import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pixiMock = vi.hoisted(() => ({
  appInstances: [] as MockApplication[],
  containerInstances: [] as { scale: { set: ReturnType<typeof vi.fn> } }[],
}))

const textureMock = vi.hoisted(() => ({
  loadTextureAtlas: vi.fn(),
}))

const farmSceneMock = vi.hoisted(() => ({
  buildFarmScene: vi.fn(),
}))

const resizeMock = vi.hoisted(() => ({
  instances: [] as MockResizeObserver[],
}))

interface MockResizeObserver {
  readonly observe: ReturnType<typeof vi.fn>
  readonly disconnect: ReturnType<typeof vi.fn>
  trigger(): void
}

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
  readonly ticker: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> }
  readonly resize: ReturnType<typeof vi.fn>
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

function makeZeroSizeContainer(): HTMLElement {
  const node = makeNode('div') as MockNode & {
    clientWidth: number
    clientHeight: number
  }
  node.clientWidth = 0
  node.clientHeight = 0
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
    private resizeTarget: { clientWidth: number; clientHeight: number } | null = null
    readonly stage = { addChild: vi.fn() }
    readonly ticker = { add: vi.fn(), remove: vi.fn() }
    readonly resize = vi.fn(() => {
      if (!this.resizeTarget) return
      this.screen.width = this.resizeTarget.clientWidth
      this.screen.height = this.resizeTarget.clientHeight
    })
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
      this.resizeTarget = options.resizeTo
      this.resize()
      pixiMock.appInstances.push(this)
    }
  }

  class Container {
    readonly scale = { set: vi.fn() }
    readonly position = { set: vi.fn() }
    constructor() {
      pixiMock.containerInstances.push(this)
    }
  }

  return { Application, Container }
})

vi.mock('./textures', () => ({
  loadTextureAtlas: textureMock.loadTextureAtlas,
}))

vi.mock('./scenes/farm', () => ({
  buildFarmScene: farmSceneMock.buildFarmScene,
}))

const inputMock = vi.hoisted(() => ({
  destroy: vi.fn(),
  read: vi.fn(() => ({ x: 0, y: 0 })),
  consumeInteract: vi.fn(() => false),
}))

const playerMock = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock('./input', async (importOriginal) => {
  // Keep the real pure functions (mergeDirections); only the live keyboard source
  // is mocked so the engine doesn't touch real window listeners.
  const actual = await importOriginal<typeof import('./input')>()
  return {
    ...actual,
    createInput: vi.fn(() => ({
      read: inputMock.read,
      consumeInteract: inputMock.consumeInteract,
      destroy: inputMock.destroy,
    })),
  }
})

/** A shared touch input source stand-in passed into `createEngine`. */
function makeTouch() {
  return {
    read: vi.fn<() => { x: number; y: number }>(() => ({ x: 0, y: 0 })),
    consumeInteract: vi.fn<() => boolean>(() => false),
    destroy: vi.fn<() => void>(),
  }
}

vi.mock('./player', () => ({
  createPlayer: vi.fn(() => ({
    update: playerMock.update,
    get px() {
      return { x: 0, y: 0 }
    },
  })),
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
    resizeMock.instances.length = 0
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly observe = vi.fn()
        readonly disconnect = vi.fn()
        constructor(private readonly callback: () => void) {
          resizeMock.instances.push(this as unknown as MockResizeObserver)
        }
        trigger(): void {
          this.callback()
        }
      },
    )
    pixiMock.appInstances.length = 0
    pixiMock.containerInstances.length = 0
    textureMock.loadTextureAtlas.mockReset()
    farmSceneMock.buildFarmScene.mockReset()
    inputMock.destroy.mockClear()
    inputMock.read.mockClear()
    inputMock.consumeInteract.mockClear()
    inputMock.consumeInteract.mockReturnValue(false)
    playerMock.update.mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('destroys the Pixi app and leaves only a visible error when texture loading fails', async () => {
    textureMock.loadTextureAtlas.mockRejectedValueOnce(new Error('missing sheet'))
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    createEngine(container, makeTouch())
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

    const engine = createEngine(container, makeTouch())
    await flushAsync()
    engine.destroy()
    resolveAtlas(atlas)
    await flushAsync()

    expect(atlas.destroy).toHaveBeenCalledTimes(1)
  })

  it('observes the container for resize on success and disconnects on destroy', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    const engine = createEngine(container, makeTouch())
    await flushAsync()

    // Resize source is the container ResizeObserver, not a window resize event.
    expect(resizeMock.instances).toHaveLength(1)
    expect(resizeMock.instances[0]?.observe).toHaveBeenCalledWith(container)

    engine.destroy()
    expect(resizeMock.instances[0]?.disconnect).toHaveBeenCalledTimes(1)
  })

  it('resizes the Pixi app from the container observer before following the camera', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    createEngine(container, makeTouch())
    await flushAsync()

    const app = pixiMock.appInstances[0]!
    app.resize.mockClear()
    const mutableContainer = container as HTMLElement & {
      clientWidth: number
      clientHeight: number
    }
    mutableContainer.clientWidth = 480
    mutableContainer.clientHeight = 320

    resizeMock.instances[0]?.trigger()

    expect(app.resize).toHaveBeenCalledTimes(1)
    expect(app.screen).toEqual({ width: 480, height: 320 })
  })

  it('disconnects the pre-init size observer when destroyed before the container is sized', async () => {
    const container = makeZeroSizeContainer()
    const { createEngine } = await import('./engine')

    const engine = createEngine(container, makeTouch())
    await flushAsync()

    expect(resizeMock.instances).toHaveLength(1)
    expect(resizeMock.instances[0]?.observe).toHaveBeenCalledWith(container)

    engine.destroy()
    expect(resizeMock.instances[0]?.disconnect).toHaveBeenCalledTimes(1)
    expect(pixiMock.appInstances).toHaveLength(0)
  })

  it('runs a ticker loop on success and stops it on teardown without destroying shared touch', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const touch = makeTouch()
    const { createEngine } = await import('./engine')

    const engine = createEngine(container, touch)
    await flushAsync()

    const app = pixiMock.appInstances[0]!
    expect(app.ticker.add).toHaveBeenCalledTimes(1)
    const tick = app.ticker.add.mock.calls[0]![0] as (t: { deltaMS: number }) => void

    // A frame merges keyboard + touch directions and advances the player.
    tick({ deltaMS: 16 })
    expect(inputMock.read).toHaveBeenCalled()
    expect(touch.read).toHaveBeenCalled()
    expect(playerMock.update).toHaveBeenCalledWith(16 / 1000, { x: 0, y: 0 }, expect.anything())

    engine.destroy()
    expect(app.ticker.remove).toHaveBeenCalledWith(tick)
    // The engine owns only its keyboard source; the shared touch is owned by the caller.
    expect(inputMock.destroy).toHaveBeenCalledTimes(1)
    expect(touch.destroy).not.toHaveBeenCalled()
  })

  it('feeds the touch direction to the player when the keyboard is idle', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const touch = makeTouch()
    touch.read.mockReturnValue({ x: 1, y: 0 })
    const { createEngine } = await import('./engine')

    createEngine(container, touch)
    await flushAsync()

    const app = pixiMock.appInstances[0]!
    const tick = app.ticker.add.mock.calls[0]![0] as (t: { deltaMS: number }) => void
    tick({ deltaMS: 16 })

    // Keyboard reads zero, so the merged direction is the touch vector.
    expect(playerMock.update).toHaveBeenCalledWith(16 / 1000, { x: 1, y: 0 }, expect.anything())
  })

  it('consumes interaction from keyboard or touch each frame', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const touch = makeTouch()
    const { createEngine } = await import('./engine')

    createEngine(container, touch)
    await flushAsync()

    const app = pixiMock.appInstances[0]!
    const tick = app.ticker.add.mock.calls[0]![0] as (t: { deltaMS: number }) => void
    tick({ deltaMS: 16 })

    // Both sources are polled for an edge-triggered interaction every frame.
    expect(inputMock.consumeInteract).toHaveBeenCalled()
    expect(touch.consumeInteract).toHaveBeenCalled()
  })

  it('sets the initial world scale from the container width', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    // makeContainer() is 320px wide → computeWorldScale(320) === 2.
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    createEngine(container, makeTouch())
    await flushAsync()

    const world = pixiMock.containerInstances[0]!
    expect(world.scale.set).toHaveBeenCalledWith(2)
  })

  it('recomputes the world scale when the container width crosses a breakpoint', async () => {
    const atlas = { getTexture: vi.fn(), destroy: vi.fn() }
    textureMock.loadTextureAtlas.mockResolvedValueOnce(atlas)
    const container = makeContainer()
    const { createEngine } = await import('./engine')

    createEngine(container, makeTouch())
    await flushAsync()

    const world = pixiMock.containerInstances[0]!
    world.scale.set.mockClear()
    const mutableContainer = container as HTMLElement & {
      clientWidth: number
      clientHeight: number
    }
    // 320 → 2×; widen to 1200 → computeWorldScale(1200) === 4.
    mutableContainer.clientWidth = 1200
    mutableContainer.clientHeight = 800

    resizeMock.instances[0]?.trigger()

    expect(world.scale.set).toHaveBeenCalledWith(4)
  })
})
