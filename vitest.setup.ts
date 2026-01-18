import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Ensure DOM is cleaned between tests to avoid cross-test interference
afterEach(() => {
	cleanup()
})

// Stub the barrel import of MUI icons to avoid loading many files on Windows
// Temporarily disabled to debug hanging issue
// vi.mock('@mui/icons-material', () => {
// 	const Stub = (props: any) => React.createElement('svg', { 'data-testid': props['data-testid'] || 'mui-icon-stub' })
// 	const proxied = new Proxy({}, { get: () => Stub })
// 	return proxied
// })
