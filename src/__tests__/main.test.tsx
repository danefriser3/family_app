import { vi } from 'vitest'
// vitest APIs are available globally via setup; no separate expect import needed
import React from 'react'

// Mock Apollo pieces used by main.tsx
let lastHttpLinkUri: string | undefined
vi.mock('@apollo/client', () => ({
  ApolloClient: function ApolloClient(_cfg: any) { return {} },
  InMemoryCache: function InMemoryCache() { return {} },
  HttpLink: function HttpLink(cfg: any) { lastHttpLinkUri = cfg?.uri; return {} },
  gql: (strings: TemplateStringsArray, ..._values: unknown[]) => strings.join(''),
}))

vi.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  // Also stub hooks used by the rendered tree to avoid network
  useQuery: () => ({ data: undefined, loading: false, error: undefined }),
  useMutation: () => [vi.fn()],
  useLazyQuery: () => [vi.fn(), { data: undefined, loading: false, error: undefined }] as const,
}))

// Spy on createRoot to prevent mounting the whole app and just assert it's called correctly
const renderSpy = vi.fn()
const createRootSpy = vi.fn(() => ({ render: renderSpy }))
vi.mock('react-dom/client', async () => {
  const actual = await vi.importActual<typeof import('react-dom/client')>('react-dom/client')
  return {
    ...actual,
    createRoot: createRootSpy,
  }
})

describe('main.tsx bootstrap', () => {
  it('mounts the App into #root (bootstrap executes)', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    await import('../main')
    const el = document.getElementById('root')
    expect(createRootSpy).toHaveBeenCalledWith(el)
    expect(renderSpy).toHaveBeenCalledTimes(1)
  })

  it('uses VITE_SERVER_URL when defined to build Apollo HttpLink', async () => {
    // Reset module cache so main.tsx runs fresh
    vi.resetModules()
    // Ensure spies are clean
    createRootSpy.mockClear()
    renderSpy.mockClear()
    lastHttpLinkUri = undefined

    // Stub Vite env var and provide #root
    vi.stubEnv('VITE_SERVER_URL', 'http://api.example/')
    document.body.innerHTML = '<div id="root"></div>'

    await import('../main')

    // Assert the HttpLink uri used the env var
    expect(lastHttpLinkUri).toBe('http://api.example/graphql')
    expect(createRootSpy).toHaveBeenCalled()

    // Cleanup the stubbed env for other tests
    vi.unstubAllEnvs()
  })
})
