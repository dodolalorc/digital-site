import type { SiteConfig } from '../data/site';
import { createI18n, normalizeLocale, type I18nMessages } from '@navfolio/core';
import { getResolvedPageModuleI18n } from '@navfolio/pages';
import navfolioConfig from '../../navfolio.config';
import en from '../i18n/en.json';
import zhCN from '../i18n/zh-CN.json';
import zhTW from '../i18n/zh-TW.json';

export const defaultUiLanguage = 'en';

const rawUiText = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
} as const;

type TemplateValues = Record<string, string | number>;
type Message = string | { one?: string; other: string };

type RawUiText = {
  locale: string;
  doing: {
    recently: string;
  };
  heatmap: {
    totalPosts: string;
    activeDays: string;
    dayStreak: string;
    latest: string;
    latestPublishedPosts: string;
    openLatestPost: Message;
    less: string;
    more: string;
    weekdays: string[];
    writingSince: Message;
    recentWeeks: Message;
    upcoming: string;
    postCount: Message;
  };
  groups: {
    categories: string;
    series: string;
    category: string;
    tag: string;
    tags: string;
    years: string;
    back: string;
    allArticles: string;
    uncategorized: string;
    expand: string;
    collapse: string;
    browseByTopic: string;
    followConnectedNotes: string;
    blogBrowsingGroups: string;
    emptyCategories: string;
    emptySeries: string;
    emptyTags: string;
    emptyArchives: string;
    tagCloud: string;
    tagCloudKicker: string;
    tagCloudNote: string;
    yearArchives: string;
    yearArchivesKicker: string;
    yearArchivesNote: string;
    articleCount: Message;
    categoryNote: Message;
    seriesNote: Message;
    tagNote: Message;
    publishedCount: Message;
    publishedArticles: Message;
    viewMore: Message;
  };
  article: {
    metadata: string;
    groups: string;
    readingTools: string;
    wordCount: Message;
    readingTime: Message;
    moreInSeries: Message;
    previousInSeries: Message;
    nextInSeries: Message;
    pinned: string;
    moreFromSite: Message;
  };
  toc: {
    title: string;
    open: string;
    close: string;
    expand: string;
    collapse: string;
    showAll: string;
    collapseButton: string;
  };
  pagination: {
    blog: string;
    previous: string;
    next: string;
    page: Message;
  };
  search: {
    title: string;
    trigger: string;
    close: string;
    idle: string;
    loading: string;
    empty: string;
    unavailable: string;
    resultKinds: {
      blogNote: string;
      blogIndex: string;
      vibe: string;
      project: string;
      page: string;
    };
    matchedPassage: string;
  };
};

export type UiLanguage = keyof typeof rawUiText;

export type UiText = Omit<RawUiText, 'heatmap' | 'groups' | 'article' | 'pagination'> & {
  heatmap: Omit<
    RawUiText['heatmap'],
    'openLatestPost' | 'writingSince' | 'recentWeeks' | 'postCount'
  > & {
    openLatestPost: (title: string) => string;
    writingSince: (date: string) => string;
    recentWeeks: (weeks: number) => string;
    postCount: (count: number) => string;
  };
  groups: Omit<
    RawUiText['groups'],
    | 'articleCount'
    | 'categoryNote'
    | 'seriesNote'
    | 'tagNote'
    | 'publishedCount'
    | 'publishedArticles'
    | 'viewMore'
  > & {
    articleCount: (count: number) => string;
    categoryNote: (count: number) => string;
    seriesNote: (count: number) => string;
    tagNote: (count: number) => string;
    publishedCount: (count: number) => string;
    publishedArticles: (count: number) => string;
    viewMore: (count: number) => string;
  };
  article: Omit<
    RawUiText['article'],
    | 'wordCount'
    | 'readingTime'
    | 'moreInSeries'
    | 'previousInSeries'
    | 'nextInSeries'
    | 'moreFromSite'
  > & {
    wordCount: (count: number) => string;
    readingTime: (minutes: number) => string;
    moreInSeries: (name: string) => string;
    previousInSeries: (name: string) => string;
    nextInSeries: (name: string) => string;
    moreFromSite: (siteTitle: string) => string;
  };
  pagination: Omit<RawUiText['pagination'], 'page'> & {
    page: (current: number, total: number) => string;
  };
};

function formatMessage(message: Message, values: TemplateValues = {}) {
  const template =
    typeof message === 'string'
      ? message
      : Number(values.count) === 1 && message.one
        ? message.one
        : message.other;

  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''));
}

function formatNumber(value: number, locale: string) {
  return value.toLocaleString(locale);
}

function createUiText(raw: RawUiText): UiText {
  return {
    locale: raw.locale,
    doing: raw.doing,
    heatmap: {
      ...raw.heatmap,
      openLatestPost: (title) => formatMessage(raw.heatmap.openLatestPost, { title }),
      writingSince: (date) => formatMessage(raw.heatmap.writingSince, { date }),
      recentWeeks: (weeks) => formatMessage(raw.heatmap.recentWeeks, { weeks }),
      postCount: (count) => formatMessage(raw.heatmap.postCount, { count }),
    },
    groups: {
      ...raw.groups,
      articleCount: (count) => formatMessage(raw.groups.articleCount, { count }),
      categoryNote: (count) => formatMessage(raw.groups.categoryNote, { count }),
      seriesNote: (count) => formatMessage(raw.groups.seriesNote, { count }),
      tagNote: (count) => formatMessage(raw.groups.tagNote, { count }),
      publishedCount: (count) => formatMessage(raw.groups.publishedCount, { count }),
      publishedArticles: (count) => formatMessage(raw.groups.publishedArticles, { count }),
      viewMore: (count) => formatMessage(raw.groups.viewMore, { count }),
    },
    article: {
      ...raw.article,
      wordCount: (count) =>
        formatMessage(raw.article.wordCount, {
          count: formatNumber(count, raw.locale),
        }),
      readingTime: (minutes) => formatMessage(raw.article.readingTime, { minutes }),
      moreInSeries: (name) => formatMessage(raw.article.moreInSeries, { name }),
      previousInSeries: (name) => formatMessage(raw.article.previousInSeries, { name }),
      nextInSeries: (name) => formatMessage(raw.article.nextInSeries, { name }),
      moreFromSite: (siteTitle) => formatMessage(raw.article.moreFromSite, { siteTitle }),
    },
    toc: raw.toc,
    pagination: {
      ...raw.pagination,
      page: (current, total) => formatMessage(raw.pagination.page, { current, total }),
    },
    search: raw.search,
  };
}

const uiText = Object.fromEntries(
  Object.entries(rawUiText).map(([language, text]) => [language, createUiText(text)]),
) as Record<UiLanguage, UiText>;

export function normalizeUiLanguage(value: string | undefined): UiLanguage {
  return normalizeLocale(value, defaultUiLanguage) as UiLanguage;
}

export function getUiLanguage(config: SiteConfig): UiLanguage {
  return normalizeUiLanguage(config.theme.lang);
}

export function getUiText(config: SiteConfig): UiText {
  return uiText[getUiLanguage(config)];
}

export function getI18n(config: SiteConfig) {
  return createI18n({
    locale: config.theme.lang,
    catalogs: [
      rawUiText as unknown as Record<string, I18nMessages>,
      ...getResolvedPageModuleI18n(navfolioConfig).map((contribution) => contribution.messages),
    ],
  });
}

export function getHtmlLang(config: SiteConfig): UiText['locale'] {
  return getUiText(config).locale;
}
