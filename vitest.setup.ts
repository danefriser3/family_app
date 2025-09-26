import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Ensure DOM is cleaned between tests to avoid cross-test interference
afterEach(() => {
	cleanup()
})

// Stub the barrel import of MUI icons to avoid loading many files on Windows
vi.mock('@mui/icons-material', () => {
	const Stub = (props: any) => React.createElement('svg', { 'data-testid': props['data-testid'] || 'mui-icon-stub' })
	const proxied = new Proxy({}, { get: () => Stub })
	return proxied
})
