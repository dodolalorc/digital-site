import { getEntry } from 'astro:content';
import navfolioConfig from '../../navfolio.config';
import {
  getConfiguredPageModules,
  getResolvedPageModule,
  getResolvedPageModules,
  normalizeModuleRoute,
} from '../plugins/config';
import type { NavfolioPageModuleId } from '../modules';

export async function getSiteConfig() {
  const entry = await getEntry('siteConfig', 'config');

  if (!entry) {
    throw new Error('Missing site config entry in src/config/site.toml');
  }

  return entry.data;
}

export async function getThemePalette() {
  const { theme } = await getSiteConfig();

  return theme.palette;
}

const defaultModuleRoutes: Record<NavfolioPageModuleId, string> = {
  projects: '/projects',
  vibe: '/vibe',
};

function linkMatchesModule(href: string, moduleId: NavfolioPageModuleId, moduleRoute: string) {
  if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) {
    return false;
  }

  const normalizedHref = normalizeModuleRoute(href);

  return normalizedHref === defaultModuleRoutes[moduleId] || normalizedHref === moduleRoute;
}

export async function getTopNavLinks() {
  const { topNav } = await getSiteConfig();
  const configuredModules = getConfiguredPageModules(navfolioConfig);

  return topNav.links.flatMap((link) => {
    const matchedModule = configuredModules.find((module) =>
      linkMatchesModule(link.href, module.id, normalizeModuleRoute(module.route)),
    );

    if (!matchedModule) return [link];

    const resolvedModule = getResolvedPageModule(navfolioConfig, matchedModule.id);

    if (!resolvedModule) return [];

    return [
      {
        ...link,
        href: resolvedModule.route,
      },
    ];
  });
}

export function getRouteLabels(): Record<string, string> {
  const routeLabels: Record<string, string> = {
    '/blog': 'blog',
    '/archive': 'archive',
    '/about': 'about',
  };

  for (const module of getResolvedPageModules(navfolioConfig)) {
    routeLabels[module.route] = module.id;
  }

  return routeLabels;
}

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;
export type ThemePalette = SiteConfig['theme']['palette'];
export type SiteProfile = SiteConfig['profile'];
export type SiteTheme = SiteConfig['theme'];
export type SiteLink = SiteConfig['topNav']['links'][number];
export type SiteSearch = SiteConfig['search'];
export type SiteMath = SiteConfig['math'];
export type SiteFonts = SiteConfig['fonts'];
export type SitePages = SiteConfig['pages'];
export type HomeNavigationItem = SiteConfig['home']['navigation'][number];
export type HomeLinkItem = SiteConfig['home']['links'][number];
export type HomeDoingItem = SiteConfig['home']['doing'][number];
export type HomeIntro = SiteConfig['home']['intro'];
export type HomeQuote = SiteConfig['home']['quote'];
export type HomeLatest = SiteConfig['home']['latest'];
