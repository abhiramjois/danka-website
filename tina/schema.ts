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
  isBody: true,
} as any)

const homeFields: NonNullable<Collection<true>['fields']> = [
  {
    type: 'string',
    name: 'hero_title',
    label: 'Hero title',
    required: false,
    ui: { defaultValue: 'An art collective' },
  },
  {
    type: 'string',
    name: 'tagline',
    label: 'Tagline',
    required: false,
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
    required: false,
    ui: {
      defaultValue:
        'We have begun our journey with the Youtube channel Danka studios.',
    },
  },
  {
    type: 'string',
    name: 'cta_title',
    label: 'CTA title',
    required: false,
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
    required: false,
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
    required: false,
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
    required: false,
    ui: { defaultValue: '4,530' },
  },
  {
    type: 'string',
    name: 'stats_videos',
    label: 'Videos (fallback)',
    required: false,
    ui: { defaultValue: '72' },
  },
  {
    type: 'string',
    name: 'stats_views',
    label: 'Views (fallback)',
    required: false,
    ui: { defaultValue: '700K' },
  },
  {
    type: 'object',
    name: 'what_we_do',
    label: 'What we do',
    list: true,
    description: 'The illustration grid under the CTA. Add, remove or reorder cards here.',
    required: false,
    ui: {
      itemProps: (item: Record<string, unknown>) => ({
        label: String(item.label ?? 'Card'),
      }),
      defaultItem: () => ({ label: 'New card', illustration: '' }),
    },
    fields: [
      {
        type: 'string',
        name: 'label',
        label: 'Label',
        required: false,
        ui: { defaultValue: 'Short films' },
      },
      {
        type: 'image',
        name: 'illustration',
        label: 'Illustration',
        required: false,
        description: 'Illustration shown on the home page grid.',
      },
    ],
  },
  {
    type: 'string',
    name: 'data_updated_note',
    label: 'Data note (optional)',
    required: false,
  },
]

const simplePageFields: NonNullable<Collection<true>['fields']> = [
  pageTitle('Page title', ''),
  pageDescription(),
]

export const schema: Collection<true>[] = [
  {
    name: 'home',
    label: 'Home page',
    description: 'Everything on the home page — hero, CTA, What we do grid and team section.',
    path: 'content/pages',
    format: 'md',
    match: { include: 'home' },
    ui: {
      global: true,
      allowedActions: { create: false, delete: false, duplicate: false },
    },
    fields: homeFields,
  },

  {
    name: 'pages',
    label: 'Other pages',
    description: 'The remaining standalone pages.',
    path: 'content/pages',
    format: 'md',
    match: { exclude: 'home' },
    ui: {
      allowedActions: { create: true, delete: true },
    },
    templates: [
      {
        name: 'simple',
        label: 'Simple page',
        ui: { defaultItem: () => ({}) },
        fields: simplePageFields,
      },
    ],
  },

  {
    name: 'folio',
    label: 'Folio',
    description: 'Portfolio projects — title, linked URL, rich description, cover, posters and screengrabs.',
    path: 'content/folio',
    format: 'md',
    ui: {
      filename: { slugify: (values) => String(values.title ?? 'untitled') },
      allowedActions: { create: true, delete: true },
    },
    fields: [
      { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true, description: 'Used to build the page slug automatically.' },
      { type: 'string', name: 'url', label: 'Linked URL', required: false, description: 'Where the project lives (YouTube, Vimeo, website…).' },
      { type: 'datetime', name: 'date', label: 'Release date', required: false },
      { type: 'string', name: 'tags', label: 'Tags', list: true, required: false },
      { type: 'string', name: 'director', label: 'Director', required: false },
      { type: 'string', name: 'writer', label: 'Writer', required: false },
      {
        type: 'object', name: 'cast_crew', label: 'Cast & Crew', list: true, required: false, description: 'Anyone credited on the project. 1 role = 1 entry.',
        ui: {
          itemProps: (item) => ({ label: item.role && item.name ? `${item.role} - ${item.name}` : 'Cast & Crew item' }),
        },
        fields: [
          { type: 'string', name: 'role', label: 'Role', required: true, description: 'e.g. Cast, Director of Photography, Sound…' },
          { type: 'string', name: 'name', label: 'Name', required: true },
        ],
      },
      { type: 'image', name: 'cover', label: 'Cover image', required: false, description: 'Large image shown at the top of the project page and on the folio card.' },
      { type: 'image', name: 'posters', label: 'Posters / Thumbnails', list: true, required: false, description: 'Poster and thumbnail images.' },
      { type: 'image', name: 'screengrabs', label: 'Screengrabs', list: true, required: false, description: 'Frames or screengrabs from the project.' },
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
      allowedActions: { create: true, delete: true },
      defaultItem: () => ({ name: 'New Person' }),
    },
    fields: [
      { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true, description: 'Used to build the page slug automatically.' },
      { type: 'image', name: 'photo', label: 'Profile photo' },
      { type: 'string', name: 'roles', label: 'Roles', list: true, required: false, description: 'e.g. Filmmaker, Director, Writer…' },
      markdownBody('Bio'),
    ],
  },]

export default schema
