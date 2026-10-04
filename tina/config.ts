import { defineConfig } from 'tinacms'
import schema from './schema'

// Tina needs the branch *name* to match the branch connected in TinaCloud.
// Netlify sets BRANCH to the name and HEAD to the commit SHA, so HEAD must
// not be preferred here or the admin queries a branch that does not exist.
const branch =
  process.env.TINA_BRANCH || process.env.BRANCH || process.env.HEAD || 'main'

// From app.tina.io → your project → "Connect" screen.
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null
const token = process.env.TINA_TOKEN || null

export default defineConfig({
  branch,
  clientId,
  token,
  // Do not set `authProvider`. tinacms builds its own TinaCloudAuthProvider
  // from clientId/token when none is configured. @tinacms/auth's
  // TinaCloudBackendAuthProvider is a Next.js API-route helper that lacks
  // getSessionProvider and breaks the admin bundle.
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