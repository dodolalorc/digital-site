import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

type CollectionSchemaFactory = Extract<
  Parameters<typeof defineCollection>[0]['schema'],
  (...args: any[]) => any
>;

const sidebarSchema = z
  .object({
    enable: z.boolean().optional(),
    toc: z.boolean().optional(),
    relatedPosts: z.boolean().optional(),
  })
  .optional();

const remoteImageSchema = z
  .url()
  .refine((src) => /^https?:\/\//i.test(src), 'Remote images must start with http:// or https://');

const siteUrlSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  if (!trimmed || /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}, z.url());

const contentImageSchema = ({ image }: Parameters<CollectionSchemaFactory>[0]) =>
  z.union([image(), remoteImageSchema]);

const articleSchema = ({ image }: Parameters<CollectionSchemaFactory>[0]) =>
  z.object({
    title: z.string(),
    description: z.string(),
    // Creation date. Accepts ISO 8601 strings and plain dates such as YYYY-MM-DD.
    date: z.coerce.date(),
    draft: z.boolean().optional().default(false),
    heroImage: z.optional(contentImageSchema({ image })),
    showHeroImage: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional().default([]),
    categories: z.array(z.string()).optional().default([]),
    series: z.array(z.string()).optional().default([]),
    comments: z.boolean().optional().default(true),
    sidebar: sidebarSchema,
  });

const blogArticleSchema = (context: Parameters<CollectionSchemaFactory>[0]) =>
  articleSchema(context).extend({
    sticky: z.union([z.boolean(), z.number().positive()]).optional().default(false),
  });

const contentSource = process.env.NAVFOLIO_CONTENT_SOURCE === 'docs' ? 'docs' : 'content';
const contentBase = contentSource === 'docs' ? './src/docs' : './src/content';

const commentProviderSchema = z.enum(['giscus', 'utterances', 'waline', 'none']);
const mathRendererSchema = z.enum(['katex', 'mathjax']);
const paletteSchema = z.enum([
  'green-soft',
  'green-vivid',
  'rose-soft',
  'pink-soft',
  'purple-soft',
  'blue-soft',
  'orange-soft',
  'brown-soft',
]);

const collapseStyleSchema = z.enum([
  'github',
  'collapsible-start',
  'collapsible-end',
  'collapsible-auto',
]);
const blogCoverImageStyleSchema = z.enum(['card', 'mask']);

const defaultCodeConfig = {
  lightTheme: 'catppuccin-latte',
  darkTheme: 'catppuccin-macchiato',
  lineNumbers: true,
  wrap: true,
  preserveIndent: true,
  collapseStyle: 'github',
} as const;

const defaultMathConfig = {
  render: 'katex',
} satisfies {
  render: z.infer<typeof mathRendererSchema>;
};

const defaultFontConfig = {
  en: 'Maple Mono',
  code: 'Maple Mono',
  zh: 'ChillRoundM',
  file: '/fonts/ChillRoundM.ttf',
};

const nonEmptyStringSchema = (fallback: string) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().min(1).optional().default(fallback),
  );

const defaultGiscusConfig = {
  repo: '',
  repo_id: '',
  category: '',
  category_id: '',
  mapping: 'pathname',
  strict: '0',
  reactions_enabled: '1',
  emit_metadata: '0',
  input_position: 'bottom',
  light_theme: 'github-light',
  dark_theme: 'github-dark',
  lang: 'zh-CN',
  loading: 'lazy',
};

const defaultUtterancesConfig = {
  repo: '',
  issue_term: 'pathname',
  label: 'comment',
  theme: 'github-light',
};

const defaultWalineConfig = {
  server_url: '',
  lang: 'zh-CN',
  dark: 'html.dark',
  pageview: true,
  comment: true,
};

const defaultCommentsConfig = {
  enabled: false,
  provider: 'none',
  show_on_posts: true,
  giscus: defaultGiscusConfig,
  utterances: defaultUtterancesConfig,
  waline: defaultWalineConfig,
} satisfies {
  enabled: boolean;
  provider: z.infer<typeof commentProviderSchema>;
  show_on_posts: boolean;
  giscus: typeof defaultGiscusConfig;
  utterances: typeof defaultUtterancesConfig;
  waline: typeof defaultWalineConfig;
};

const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

const navigationItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
});

const homeLinkSchema = z.object({
  label: z.string(),
  icon: z.string(),
  tooltip: z.string().trim(),
  copy: z.boolean(),
});

const defaultPagesConfig = {
  blog: {
    title: 'Writing notes',
    kicker: 'Notebook archive',
    subtitle: 'Notes from the margins.',
    note: 'Field notes, drafts, and technical margins arranged for slow browsing.',
    postsPerPage: 6,
    coverImageStyle: 'card',
    categories: {
      title: 'Categories',
      kicker: 'Browse notes',
      subtitle: '',
      note: 'A quiet index of recurring topics, gathered from article frontmatter.',
    },
    series: {
      title: 'Series',
      kicker: 'Reading paths',
      subtitle: '',
      note: 'Connected notes that can be followed in the order they were written.',
    },
  },
  projects: {
    title: 'Projects',
    kicker: 'Project shelf',
    subtitle: 'Small tools and site systems.',
    note: 'A compact shelf for implementation choices, releases, and publishing experiments.',
  },
  vibe: {
    title: 'vibe',
    kicker: '',
    subtitle: 'Life and coding fragments.',
    note: 'Not formal enough for blog posts, but still part of the story.',
    showTrail: true,
  },
} as const;

const blogPageSchema = z.object({
  title: z.string().optional().default(defaultPagesConfig.blog.title),
  kicker: z.string().optional().default(defaultPagesConfig.blog.kicker),
  subtitle: z.string().optional().default(defaultPagesConfig.blog.subtitle),
  note: z.string().optional().default(defaultPagesConfig.blog.note),
  postsPerPage: z
    .number()
    .int()
    .positive()
    .optional()
    .default(defaultPagesConfig.blog.postsPerPage),
  coverImageStyle: blogCoverImageStyleSchema
    .optional()
    .default(defaultPagesConfig.blog.coverImageStyle),
  categories: z
    .object({
      title: z.string().optional().default(defaultPagesConfig.blog.categories.title),
      kicker: z.string().optional().default(defaultPagesConfig.blog.categories.kicker),
      subtitle: z.string().optional().default(defaultPagesConfig.blog.categories.subtitle),
      note: z.string().optional().default(defaultPagesConfig.blog.categories.note),
    })
    .optional()
    .default(defaultPagesConfig.blog.categories),
  series: z
    .object({
      title: z.string().optional().default(defaultPagesConfig.blog.series.title),
      kicker: z.string().optional().default(defaultPagesConfig.blog.series.kicker),
      subtitle: z.string().optional().default(defaultPagesConfig.blog.series.subtitle),
      note: z.string().optional().default(defaultPagesConfig.blog.series.note),
    })
    .optional()
    .default(defaultPagesConfig.blog.series),
});

const projectsPageSchema = z.object({
  title: z.string().optional().default(defaultPagesConfig.projects.title),
  kicker: z.string().optional().default(defaultPagesConfig.projects.kicker),
  subtitle: z.string().optional().default(defaultPagesConfig.projects.subtitle),
  note: z.string().optional().default(defaultPagesConfig.projects.note),
});

const vibePageSchema = z.object({
  title: z.string().optional().default(defaultPagesConfig.vibe.title),
  kicker: z.string().optional().default(defaultPagesConfig.vibe.kicker),
  subtitle: z.string().optional().default(defaultPagesConfig.vibe.subtitle),
  note: z.string().optional().default(defaultPagesConfig.vibe.note),
  showTrail: z.boolean().optional().default(defaultPagesConfig.vibe.showTrail),
});

const siteConfig = defineCollection({
  loader: file('./src/config/site.toml'),
  schema: z.object({
    site: z.object({
      title: z.string(),
      description: z.string(),
      pageTitle: z.string(),
      pageDescription: z.string(),
      url: siteUrlSchema,
      repository: z.url(),
      footerNote: z.string(),
    }),
    theme: z
      .object({
        palette: paletteSchema.optional().default('green-soft'),
      })
      .optional()
      .default({
        palette: 'green-soft',
      }),
    fonts: z
      .object({
        en: nonEmptyStringSchema(defaultFontConfig.en),
        code: nonEmptyStringSchema(defaultFontConfig.code),
        zh: nonEmptyStringSchema(defaultFontConfig.zh),
        file: nonEmptyStringSchema(defaultFontConfig.file),
      })
      .optional()
      .default(defaultFontConfig),
    code: z
      .object({
        lightTheme: z.string().optional().default(defaultCodeConfig.lightTheme),
        darkTheme: z.string().optional().default(defaultCodeConfig.darkTheme),
        lineNumbers: z.boolean().optional().default(defaultCodeConfig.lineNumbers),
        wrap: z.boolean().optional().default(defaultCodeConfig.wrap),
        preserveIndent: z.boolean().optional().default(defaultCodeConfig.preserveIndent),
        collapseStyle: collapseStyleSchema.optional().default(defaultCodeConfig.collapseStyle),
      })
      .optional()
      .default(defaultCodeConfig),
    math: z
      .object({
        render: mathRendererSchema.optional().default(defaultMathConfig.render),
      })
      .optional()
      .default(defaultMathConfig),
    comments: z
      .object({
        enabled: z.boolean().optional().default(false),
        provider: commentProviderSchema.optional().default('none'),
        show_on_posts: z.boolean().optional().default(true),
        giscus: z
          .object({
            repo: z.string().optional().default(''),
            repo_id: z.string().optional().default(''),
            category: z.string().optional().default(''),
            category_id: z.string().optional().default(''),
            mapping: z.string().optional().default('pathname'),
            strict: z.string().optional().default('0'),
            reactions_enabled: z.string().optional().default('1'),
            emit_metadata: z.string().optional().default('0'),
            input_position: z.string().optional().default('bottom'),
            light_theme: z.string().optional().default('light'),
            dark_theme: z.string().optional().default('dark'),
            lang: z.string().optional().default('zh-CN'),
            loading: z.string().optional().default('lazy'),
          })
          .optional()
          .default(defaultGiscusConfig),
        utterances: z
          .object({
            repo: z.string().optional().default(''),
            issue_term: z.string().optional().default('pathname'),
            label: z.string().optional().default('comment'),
            theme: z.string().optional().default('github-light'),
          })
          .optional()
          .default(defaultUtterancesConfig),
        waline: z
          .object({
            server_url: z.string().optional().default(''),
            lang: z.string().optional().default('zh-CN'),
            dark: z.string().optional().default('html.dark'),
            pageview: z.boolean().optional().default(true),
            comment: z.boolean().optional().default(true),
          })
          .optional()
          .default(defaultWalineConfig),
      })
      .optional()
      .default(defaultCommentsConfig),
    profile: z.object({
      name: z.string(),
      handle: z.string(),
      role: z.string(),
      company: z.string(),
      location: z.string(),
      email: z.email(),
      website: z.url(),
      github: z.url(),
      meta: z.string(),
      avatar: z.string(),
    }),
    topNav: z.object({
      links: z.array(linkSchema.omit({ icon: true })),
    }),
    search: z
      .object({
        enabled: z.boolean().optional().default(true),
        shortcut: z.enum(['mod+k']).optional().default('mod+k'),
        placeholder: z.string().optional().default('Search notes...'),
        maxResults: z.number().int().positive().optional().default(6),
      })
      .optional()
      .default({
        enabled: true,
        shortcut: 'mod+k',
        placeholder: 'Search notes...',
        maxResults: 6,
      }),
    pages: z
      .object({
        blog: blogPageSchema.optional().default(defaultPagesConfig.blog),
        projects: projectsPageSchema.optional().default(defaultPagesConfig.projects),
        vibe: vibePageSchema.optional().default(defaultPagesConfig.vibe),
      })
      .optional()
      .default(defaultPagesConfig),
    home: z.object({
      quote: z.object({
        text: z.array(z.string()).min(1),
        image: z.string(),
      }),
      intro: z.object({
        title: z.string(),
        name: z.string(),
        body: z.array(z.string()).min(1),
        image: z.string(),
      }),
      latest: z
        .object({
          count: z.number().int().positive().default(1),
          heatmapWeeks: z.number().int().positive().default(24),
          showHeatmapLatest: z.boolean().optional().default(true),
          excludeDraft: z.boolean().optional().default(true),
          startDate: z.string().optional().default(''),
          dateArchiveBaseHref: z.string().optional().default(''),
        })
        .optional()
        .default({
          count: 1,
          heatmapWeeks: 24,
          showHeatmapLatest: true,
          excludeDraft: true,
          startDate: '',
          dateArchiveBaseHref: '',
        }),
      navigation: z.array(navigationItemSchema),
      links: z.array(homeLinkSchema).optional().default([]),
      doing: z.array(
        z.object({
          text: z.string(),
          mark: z.string(),
        }),
      ),
    }),
  }),
});

const blog = defineCollection({
  loader: glob({ base: `${contentBase}/blog`, pattern: '**/*.{md,mdx}' }),
  // Type-check frontmatter using a schema
  schema: blogArticleSchema,
});

const about = defineCollection({
  loader: glob({ base: contentBase, pattern: 'about.{md,mdx}' }),
  schema: articleSchema,
});

const projects = defineCollection({
  loader: glob({ base: `${contentBase}/projects`, pattern: '**/*.{md,mdx}' }),
  schema: articleSchema,
});

const vibe = defineCollection({
  loader: glob({ base: `${contentBase}/vibe`, pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      draft: z.boolean().optional().default(false),
      type: z.enum(['text', 'photo', 'quote', 'code', 'mixed']).optional().default('text'),
      mood: z.string().optional(),
      location: z.string().optional(),
      images: z.array(contentImageSchema({ image })).optional().default([]),
      tags: z.array(z.string()).optional().default([]),
      align: z.enum(['left', 'right', 'center']).optional(),
      size: z.enum(['sm', 'md', 'lg']).optional().default('md'),
    }),
});

export const collections = { about, blog, projects, vibe, siteConfig };
