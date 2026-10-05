# Danka Studios — Website

Website for the art collective **Danka Studios** ([YouTube @DankaStudios](https://www.youtube.com/@DankaStudios)), built with SvelteKit and managed with **Tina CMS**.

- Black + terracotta (`#cc7c74`) editorial design, matching `landingpage.pdf`
- Home: hero, **live YouTube stats & latest-video thumbnails**, CTA, collaboration types and team sections
- `/folio` — projects: title, linked URL, rich-text description, gallery, tags (sub-pages slugged by title)
- `/people` — members: name, profile photo, bio, roles (sub-pages slugged by title)
- `/collaborate` — collab types: type, description, link to a Folio project (sub-pages slugged by title)
- Content authored entirely through Tina CMS at **`/admin`**

## Getting started

```sh
npm install
cp .env.example .env   # add your Tina Cloud credentials
npm run dev -- --open
```

`npm run dev` runs the Tina dev server alongside Vite, so the CMS at `/admin` can
read and write your local content. Use `npm run dev:site` if you only want the
site without the CMS.

### Tina CMS

The admin app is served at **`/admin/index.html`** (generated into `static/admin/`
by `tinacms dev` / `tinacms build`). Its content model lives in `tina/schema.ts`
and its options in `tina/config.ts`.

Auth is handled by **Tina Cloud**, so there are no GitHub personal access tokens
and no site-level identity provider. Collaborators are invited by email from
the Tina dashboard.

1. Create a free project at [app.tina.io](https://app.tina.io) and connect
   `dankastudios/danka-website`
2. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_TINA_CLIENT_ID` and
   `TINA_TOKEN` from the project's **Connect** screen
3. Add the same two variables under **Settings → Variables and Secrets** in the
   Cloudflare dashboard, applied to the Production environment, then redeploy

`tina/tina-lock.json` pins the schema Tina Cloud indexes — it contains no
credentials and is committed. Re-run `npm run tina:build` and commit it after
any change to `tina/schema.ts`.

Until those variables are set, `npm run build` skips the CMS build and logs a
warning rather than failing, so the site itself always deploys.

Media uploads go to `static/images/` and are served from `/images/…`, matching
the existing image paths.

### YouTube data

Stats (subscribers / videos / views — including Shorts) and the latest video thumbnails are refreshed by `scripts/fetch-youtube.mjs`, which uses **yt-dlp** and writes `src/lib/data/youtube.json`. The site imports that JSON at build time and `/api/youtube` serves it, so refresh it before building:

```sh
brew install yt-dlp   # once
npm run fetch:youtube
```

Optionally set `YOUTUBE_CHANNEL_URL` or `YTDLP_PATH` in `.env`.

> If yt-dlp isn't available or YouTube blocks the request, the site falls back to the numbers in the Home page content (editable in the CMS) and placeholder thumbnails.

### Content structure

```
content/
  pages/home.md          homepage copy (hero, CTA, stats fallbacks…)
  pages/folio.md         folio page intro
  pages/people.md        people page intro
  pages/collaborate.md   collaborate page intro
  folio/*.md             folio projects (title, url, date, tags, gallery, body)
  people/*.md            people (name, photo, roles, body)
  collaborations/*.md    collab types (title, subtitle, image, folio link, body)
```

New entries created in the CMS are saved to `{title-slug}.md` automatically.

## Building

```sh
npm run build   # tinacms build (when credentials are present) + vite build
npm run check   # svelte-check
```
## Contact form delivery

`/collaborate` posts to `/api/contact` (`src/routes/api/contact/+server.ts`),
which is the only route that is not prerendered. It hands the enquiry to
Cloudflare's email service through the `EMAIL` binding declared in
`wrangler.toml`, and `Reply-To` is set to the visitor's address so replying
goes straight back to them.

Nothing works until Email Routing is enabled on the zone:

1. Point `dankastudios.com` nameservers at Cloudflare. Email Routing is
   unavailable until Cloudflare is authoritative for the domain.
2. **Email → Email Routing → Get started** and enable it for the zone.
3. **Email → Email Routing → Destination addresses → Add** → the recipient,
   then confirm the verification email that inbox receives.
4. Deploy. Sends fail with a logged error until step 3 is confirmed.

The sending address is `website@dankastudios.com` (`FROM` in the endpoint).
It only needs to exist on the domain — no mailbox is required for it.

### Changing the recipient

The recipient is not hardcoded anywhere in the source. It is read from the
`CONTACT_EMAIL` environment variable **at build time** and inlined into the
Worker by `$env/static/private`:

```ts
import { CONTACT_EMAIL } from '$env/static/private';
```

Consequences of it being build-time rather than runtime:

- **In Cloudflare**, set it under **Settings → Builds → Environment
  variables**, not **Settings → Variables**. A runtime variable of the same
  name would be ignored.
- **Locally**, put it in `.env` (`scripts/build.mjs` loads that before Vite
  runs). `.dev.vars` is for runtime values and is not read at build time.
- **Changing it requires a rebuild.** Redeploying is not enough.
- **The build fails if it is unset** (`MISSING_EXPORT`). That is deliberate —
  a missing recipient can never be mistaken for a delivered enquiry — but it
  also means an unset variable blocks *any* deploy, including unrelated content
  edits. If you would rather have a bad deploy than a failed one, say so and
  it can be switched to a `define` in `vite.config.ts` that inlines `null`
  instead of erroring.

Because only the referenced variable is inlined, nothing else from the
environment leaks into the bundle — `TINA_TOKEN` is not present in the built
server output.

`[[send_email]]` intentionally omits `destination_address`. Setting it would
pin the binding to a single address; Email Routing's verified-destination rule
already provides that protection, and allows testing against any confirmed
address.

Cloudflare refuses to send to any address not confirmed in Email Routing, so an
unverified recipient fails at send time rather than silently going nowhere.

### Anti-abuse

The endpoint has a honeypot field, same-origin enforcement, length caps,
strict header sanitising, and a best-effort per-isolate throttle (5 submits per
10 minutes). The throttle is not a hard limit because isolates are distributed;
add a WAF rule if the form is abused.
