import { describe, expect, test } from 'bun:test';

import {
  normalizeFriendLinkItems,
  resolveFriendLinkItems,
  resolveFriendLinkItemsSafely,
} from './friend-links';

describe('friend link data helpers', () => {
  test('normalizes display fields without changing the source shape', () => {
    const [item] = normalizeFriendLinkItems([
      {
        name: '  Astro  ',
        url: '  https://astro.build/  ',
        bio: '  Static site framework  ',
        avatar: '  https://astro.build/icon.svg  ',
        backgroundImage: '  https://example.com/bg.jpg  ',
      },
    ]);

    expect(item).toMatchObject({
      name: 'Astro',
      url: 'https://astro.build/',
      avatar: 'https://astro.build/icon.svg',
      summary: 'Static site framework',
      backgroundImageUrl: 'https://example.com/bg.jpg',
      hasBackgroundImage: true,
      fallbackInitial: 'A',
    });
  });

  test('uses local items before trying a remote source', async () => {
    const items = [
      {
        name: 'Local friend',
        url: 'https://example.com/local',
      },
    ];

    const resolved = await resolveFriendLinkItems(
      {
        items,
        src: 'https://example.com/friends.json',
      },
      async () => {
        throw new Error('fetch should not be called when local items are provided');
      },
    );

    expect(resolved).toEqual(items);
  });

  test('loads friend links from a remote JSON array', async () => {
    const resolved = await resolveFriendLinkItems(
      {
        src: 'https://example.com/friends.json',
      },
      async () =>
        new Response(
          JSON.stringify([
            {
              name: 'Remote friend',
              url: 'https://example.com/remote',
              bio: 'From JSON',
            },
          ]),
        ),
    );

    expect(resolved).toEqual([
      {
        name: 'Remote friend',
        url: 'https://example.com/remote',
        bio: 'From JSON',
      },
    ]);
  });

  test('rejects remote JSON that is not an array of friend link items', async () => {
    const load = () =>
      resolveFriendLinkItems(
        {
          src: 'https://example.com/friends.json',
        },
        async () => new Response(JSON.stringify([{ name: 'Missing URL' }])),
      );

    await expect(load()).rejects.toThrow(
      'Friend link JSON from https://example.com/friends.json has an invalid item at index 0',
    );
  });

  test('reports non-successful remote responses', async () => {
    const load = () =>
      resolveFriendLinkItems(
        {
          src: 'https://example.com/friends.json',
        },
        async () => new Response('Not found', { status: 404, statusText: 'Not Found' }),
      );

    await expect(load()).rejects.toThrow(
      'Unable to load friend links from https://example.com/friends.json: 404 Not Found',
    );
  });

  test('reports remote fetch failures with the source URL', async () => {
    const load = () =>
      resolveFriendLinkItems(
        {
          src: 'https://example.com/friends.json',
        },
        async () => {
          throw new Error('network unavailable');
        },
      );

    await expect(load()).rejects.toThrow(
      'Failed to fetch friend links from https://example.com/friends.json: network unavailable',
    );
  });

  test('reports malformed remote JSON with the source URL', async () => {
    const load = () =>
      resolveFriendLinkItems(
        {
          src: 'https://example.com/friends.json',
        },
        async () => new Response('not json'),
      );

    await expect(load()).rejects.toThrow(
      'Failed to parse friend links JSON from https://example.com/friends.json',
    );
  });

  test('safely resolves to an empty list when remote data cannot be loaded', async () => {
    const errors: unknown[] = [];
    const items = await resolveFriendLinkItemsSafely(
      {
        src: 'https://example.com/friends.json',
      },
      async () => {
        throw new Error('network unavailable');
      },
      (error) => errors.push(error),
    );

    expect(items).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
  });
});
