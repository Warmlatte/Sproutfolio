declare module 'node:fs' {
  export function readdirSync(dir: URL): string[]
  export function statSync(path: URL): {
    isDirectory(): boolean
  }
}
