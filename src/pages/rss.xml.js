import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { getSiteConfig } from '../data/site';
import { sortByDateDesc } from '../utils/content-dates';

export async function GET(context) {
  const { site } = await getSiteConfig();
  const posts = sortByDateDesc(await getCollection('blog', ({ data }) => !data.draft));

  return rss({
    title: site.title,
    description: site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      tags: post.data.tags ?? [],
      categories: post.data.categories ?? [],
      series: post.data.series ?? [],
      link: `/blog/${post.id}/`,
    })),
  });
}
