// Minimal ambient type declarations for the untyped `markdown-it` runtime
// dependency (markdown-it 14 ships no bundled types and `@types/markdown-it`
// is not a dependency of this project). Only the surface this site uses:
// constructing an instance, .use(plugin), .render(md), and overriding a
// renderer rule (heading_open).

declare module 'markdown-it' {
  export interface Token {
    type: string
    tag: string
    content: string
    map: number[] | null
    [key: string]: unknown
  }

  export interface Renderer {
    rules: {
      [name: string]: RenderRule | undefined
      heading_open?: RenderRule
    }
    renderToken: (tokens: Token[], idx: number, options: Options) => string
    render: (src: string, env?: unknown) => string
  }

  export type RenderRule = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ) => string

  export interface Options {
    [key: string]: unknown
  }

  export interface PluginSimple {
    (md: MarkdownIt): void
  }

  export default class MarkdownIt {
    constructor(preset?: string, options?: Options)
    use(plugin: PluginSimple, ...params: unknown[]): this
    render(src: string, env?: unknown): string
    readonly renderer: Renderer
    readonly options: Options
  }
}
