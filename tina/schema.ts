import type { Collection } from 'tinacms'

const textarea = { component: 'textarea' } as const

const pageTitle = (label: string, value: string) => ({
  type: 'string' as const,
  name: 'title',
  label,
  ui: { defaultValue: value },
})

const pageDescription = () => ({
  type: 'string' as const,
  name: 'description',
  label: 'Page description',
  required: false,
  ui: textarea,
})

const markdownBody = (label: string) => ({
  type: 'rich-text' as const,
  name: 'body',
  label,
  required: false,
})

/**
 * Pages are single-document collections: `match.include` pins the content API
 * to one existing file, `allowedActions` hides the create/delete buttons, and
 * `global` links each one from the top-level sidebar straight into the editor.
 */
const pageCollection = (
  name: string,
  label: string,
  filename: string,
  route: string,
  fields: Collection<true>['fields'],
): Collection<true> => ({
  name,
  label,
  path: 'content/pages',
  format: 'md',
  match: { include: filename },
  ui: {
    global: true,
    allowedActions: { create: false, delete: false },
    router: () => route,
  },
  fields,
})

export const schema: Collection<true>[] = [
  pageCollection('pageHome', 'Page: Home', 'home', '/', [
    {
      type: 'string',
      name: 'hero_title',
      label: 'Hero title',
      ui: { defaultValue: 'An art collective' },
    },
    {
      type: 'string',
      name: 'tagline',
      label: 'Tagline',
      ui: { defaultValue: 'Short films | Theatre | Music' },
    },
    {
      type: 'string',
      name: 'description',
      label: 'Hero description',
      required: false,
      ui: textarea,
    },
    {
      type: 'string',
      name: 'youtube_title',
      label: 'YouTube section text',
      ui: {
        defaultValue:
          'We have begun our journey with the Youtube channel Danka studios.',
      },
    },
    {
      type: 'string',
      name: 'cta_title',
      label: 'CTA title',
      ui: { defaultValue: 'Have a story to tell?' },
    },
    {
      type: 'string',
      name: 'cta_description',
      label: 'CTA description',
      required: false,
      ui: textarea,
    },
    {
      type: 'string',
      name: 'collab_title',
      label: 'Collaboration section title',
      ui: { defaultValue: 'What we do' },
    },
    {
      type: 'string',
      name: 'collab_description',
      label: 'Collaboration section description',
      required: false,
      ui: textarea,
    },
    {
      type: 'string',
      name: 'about_title',
      label: 'Team section title',
      ui: { defaultValue: 'About our team' },
    },
    {
      type: 'string',
      name: 'about_description',
      label: 'Team section description',
      required: false,
      ui: textarea,
    },
    {
      type: 'string',
      name: 'stats_subscribers',
      label: 'Subscribers (fallback when YouTube API is off)',
      ui: { defaultValue: '4,530' },
    },
    {
      type: 'string',
      name: 'stats_videos',
      label: 'Videos (fallback)',
      ui: { defaultValue: '72' },
    },
    {
      type: 'string',
      name: 'stats_views',
      label: 'Views (fallback)',
      ui: { defaultValue: '700K' },
    },
    {
      type: 'string',
      name: 'data_updated_note',
      label: 'Data note (optional)',
      required: false,
    },
  ]),
  pageCollection('pageFolio', 'Page: Folio', 'folio', '/folio', [
    pageTitle('Page title', 'Folio'),
    pageDescription(),
  ]),
  pageCollection('pagePeople', 'Page: People', 'people', '/people', [
    pageTitle('Page title', 'People'),
    pageDescription(),
  ]),
  pageCollection('pageCollaborate', 'Page: Collaborate', 'collaborate', '/collaborate', [
    pageTitle('Page title', 'Collaborate'),
    pageDescription(),
  ]),

  {
    name: 'folio',
    label: 'Folio',
    description:
      'Portfolio projects — title, linked URL, rich description, cover, posters and screengrabs.',
    path: 'content/folio',
    format: 'md',
    ui: {
      filename: { slugify: (values) => String(values.title ?? 'untitled') },
      router: ({ document }) => `/folio/${document._sys.filename}`,
    },
    fields: [
      {
        type: 'string',
        name: 'title',
        label: 'Title',
        isTitle: true,
        required: true,
        description: 'Used to build the page slug automatically.',
      },
      {
        type: 'string',
        name: 'url',
        label: 'Linked URL',
        required: false,
        description: 'Where the project lives (YouTube, Vimeo, website…).',
      },
      { type: 'datetime', name: 'date', label: 'Release date', required: false },
      {
        type: 'string',
        name: 'tags',
        label: 'Tags',
        list: true,
        required: false,
      },
      { type: 'string', name: 'director', label: 'Director', required: false },
      { type: 'string', name: 'writer', label: 'Writer', required: false },
      {
        type: 'object',
        name: 'cast_crew',
        label: 'Cast & Crew',
        list: true,
        required: false,
        description: 'Anyone credited on the project. 1 role = 1 entry.',
        fields: [
          {
            type: 'string',
            name: 'role',
            label: 'Role',
            required: true,
            description: 'e.g. Cast, Director of Photography, Sound…',
          },
          { type: 'string', name: 'name', label: 'Name', required: true },
        ],
      },
      {
        type: 'image',
        name: 'cover',
        label: 'Cover image',
        required: false,
        description:
          'Large image shown at the top of the project page and on the folio card.',
      },
      {
        type: 'image',
        name: 'posters',
        label: 'Posters / Thumbnails',
        list: true,
        required: false,
        description: 'Poster and thumbnail images.',
      },
      {
        type: 'image',
        name: 'screengrabs',
        label: 'Screengrabs',
        list: true,
        required: false,
        description: 'Frames or screengrabs from the project.',
      },
      markdownBody('Description'),
    ],
  },

  {
    name: 'people',
    label: 'People',
    description: 'Team members — name, profile photo, bio and roles.',
    path: 'content/people',
    format: 'md',
    ui: {
      filename: { slugify: (values) => String(values.name ?? 'person') },
      router: ({ document }) => `/people/${document._sys.filename}`,
    },
    fields: [
      {
        type: 'string',
        name: 'name',
        label: 'Name',
        isTitle: true,
        required: true,
        description: 'Used to build the page slug automatically.',
      },
      { type: 'image', name: 'photo', label: 'Profile photo' },
      {
        type: 'string',
        name: 'roles',
        label: 'Roles',
        list: true,
        required: false,
        description: 'e.g. Filmmaker, Director, Writer…',
      },
      markdownBody('Bio'),
    ],
  },

  {
    name: 'collaborations',
    label: 'Collaborations',
    description: 'Collaboration types — each links to a Folio project.',
    path: 'content/collaborations',
    format: 'md',
    ui: {
      filename: { slugify: (values) => String(values.title ?? 'collaboration') },
    },
    fields: [
      {
        type: 'string',
        name: 'title',
        label: 'Collab type',
        isTitle: true,
        required: true,
        description:
          'e.g. Short films, Theatre, Music, Ad campaigns. Used to build the page slug automatically.',
      },
      {
        type: 'string',
        name: 'subtitle',
        label: 'Sub-type (optional)',
        required: false,
        description:
          'e.g. Web series, Plays, Production, for Brands — shown on the home grid.',
      },
      {
        type: 'image',
        name: 'image',
        label: 'Cover image',
        required: false,
        description: 'Shown on the home grid and the collaboration page.',
      },
      {
        type: 'reference',
        name: 'folio',
        label: 'Linked folio project',
        collections: ['folio'],
        required: false,
        description: 'Pick a Folio item to feature as related work.',
      },
      { type: 'string', name: 'url', label: 'External URL (optional)', required: false },
      markdownBody('Description'),
    ],
  },
]

export default schema