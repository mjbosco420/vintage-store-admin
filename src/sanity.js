import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: 'j7s2sxwm',
  dataset: 'production',
  apiVersion: '2025-05-01',
  useCdn: false,
})

const builder = imageUrlBuilder(client)

export const urlFor = (source) => builder.image(source)