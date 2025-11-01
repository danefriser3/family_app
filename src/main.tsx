import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'

// Prefer Vite env var if provided; fallback to current origin
/* c8 ignore next */
const serverBaseUrl = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? globalThis.location.origin

const client = new ApolloClient({
  link: new HttpLink({ uri: `${serverBaseUrl}graphql` }), // Cambia se il tuo server è su una porta diversa
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>,
)
