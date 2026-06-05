import { createClient } from '@sanity/client'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('')
globalThis.window = dom.window
globalThis.document = dom.window.document

try {
  const client = createClient({
    projectId: 'j7s2sxwm',
    dataset: 'production',
    apiVersion: '2025-05-01',
    useCdn: false,
    token: 'fake-token'
  })
  console.log('Success without warning flag')
} catch (e) {
  console.error('Error without flag:', e.message)
}

try {
  const client2 = createClient({
    projectId: 'j7s2sxwm',
    dataset: 'production',
    apiVersion: '2025-05-01',
    useCdn: false,
    token: 'fake-token',
    ignoreBrowserTokenWarning: true
  })
  console.log('Success with ignoreBrowserTokenWarning')
} catch (e) {
  console.error('Error with ignoreBrowserTokenWarning:', e.message)
}

try {
  const client3 = createClient({
    projectId: 'j7s2sxwm',
    dataset: 'production',
    apiVersion: '2025-05-01',
    useCdn: false,
    token: 'fake-token',
    allowBrowserToken: true
  })
  console.log('Success with allowBrowserToken')
} catch (e) {
  console.error('Error with allowBrowserToken:', e.message)
}
