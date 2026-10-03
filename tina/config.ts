import { defineConfig } from 'tinacms'
import { TinaCloudBackendAuthProvider } from '@tinacms/auth'
import schema from './schema'

// Netlify/most CI providers expose the deployed branch as HEAD.
const branch = process.env.HEAD || 'main'

// From app.tina.io → your project → "Connect" screen.
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null
const token = process.env.TINA_TOKEN || null

export default defineConfig({
  branch,
  clientId,
  token,
  // Sign-in is handled by Tina Cloud, so Netlify Identity is not involved.
  // Invite collaborators from the Tina dashboard — no GitHub PATs needed.
  authProvider: TinaCloudBackendAuthProvider(clientId ?? undefined),
  build: {
    // SvelteKit serves static files from `static/`, not `public/`.
    // This puts the admin SPA at /admin/index.html.
    publicFolder: 'static',
    outputFolder: 'admin',
  },
  media: {
    tina: {
      publicFolder: 'static',
      // Keeps uploads in static/images so existing /images/... paths keep working.
      mediaRoot: 'images',
    },
  },
  schema: {
    collections: schema,
  },
})