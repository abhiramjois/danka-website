# Danka Studios — Website

Website for the art collective **Danka Studios** ([YouTube @DankaStudios](https://www.youtube.com/@DankaStudios)), built with SvelteKit and managed with **Sveltia CMS**.

- Black + terracotta (`#cc7c74`) editorial design, matching `landingpage.pdf`
- Home: hero, **live YouTube stats & latest-video thumbnails**, CTA, collaboration types and team sections
- `/folio` — projects: title, linked URL, rich-text description, gallery, tags (sub-pages slugged by title)
- `/people` — members: name, profile photo, bio, roles (sub-pages slugged by title)
- `/collaborate` — collab types: type, description, link to a Folio project (sub-pages slugged by title)
- Content authored entirely through Sveltia CMS at **`/admin`**

## Getting started

```sh
npm install
npm run dev -- --open
```

### YouTube live data

Stats (subscribers / videos / views — including Shorts) and the latest video thumbnails are fetched with **yt-dlp** and refresh in real time: the client polls `/api/youtube` every 60s and responses are cached server-side for 60s.

1. Install yt-dlp once: `brew install yt-dlp`
2. (Optional) copy `.env.example` to `.env` and override `YOUTUBE_CHANNEL_URL`, `YTDLP_PATH` or `YOUTUBE_CACHE_TTL_MS`

> If yt-dlp isn't available or YouTube blocks the request, the site falls back to the numbers in the Home page content (editable in the CMS) and placeholder thumbnails.

### Sveltia CMS

The admin app is served at **`/admin`** (self-hosted build in `static/admin/`, config in `static/admin/config.yml`).

1. Push this project to its own GitHub repo (e.g. `yourname/danka-website`)
2. Set that repo in `static/admin/config.yml` → `backend.repo`
3. Open `/admin` and sign in with GitHub — content edits commit straight to `main`

### Content structure

```
content/
  pages/home.md          homepage copy (hero, CTA, stats fallbacks…)
  pages/folio.md         folio page intro
  pages/people.md        people page intro
  pages/collaborate.md   collaborate page intro
  folio/*.md             folio projects (title, url, tags, gallery, body)
  people/*.md            people (name, photo, roles, body)
  collaborations/*.md    collab types (title, subtitle, image, folio link, body)
```

New entries created in the CMS are saved to `{title-slug}.md` automatically.

## Building

```sh
npm run build   # adapter-node — requires a Node server for the YouTube proxy
```