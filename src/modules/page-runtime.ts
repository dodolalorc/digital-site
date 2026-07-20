import vibeFlightIconUrl from '../assets/icons/flight.svg?url';

export { default as BaseHead } from '../components/BaseHead.astro';
export { default as Footer } from '../components/Footer.astro';
export { default as FormattedDate } from '../components/FormattedDate.astro';
export { default as SmartImage } from '../components/SmartImage.astro';
export { default as BlogTopNav } from '../components/blog/BlogTopNav.astro';
export { default as ZoomableImage } from '@navfolio/mdx-components/ZoomableImage.astro';
export { getSiteConfig } from '../data/site';
export { getHtmlLang } from '../utils/ui-text';
export { getUiText } from '../utils/ui-text';
export { getI18n } from '../utils/ui-text';
export { vibeFlightIconUrl };
