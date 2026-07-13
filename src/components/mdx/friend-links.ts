export interface FriendLinkItem {
  name: string;
  url: string;
  bio?: string;
  avatar?: string | null;
  backgroundImage?: string | null;
}

export interface NormalizedFriendLinkItem extends FriendLinkItem {
  summary: string;
  backgroundImageUrl: string;
  hasBackgroundImage: boolean;
  fallbackInitial: string;
}

export interface FriendLinkSource {
  items?: FriendLinkItem[];
  src?: string;
}

type FriendLinkFetcher = (input: string) => Promise<Response>;
type FriendLinkErrorLogger = (error: unknown) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOptionalStringOrNull = (value: unknown) =>
  value === undefined || value === null || typeof value === 'string';

const isFriendLinkItem = (value: unknown): value is FriendLinkItem => {
  if (!isRecord(value)) return false;

  return (
    typeof value.name === 'string' &&
    typeof value.url === 'string' &&
    isOptionalStringOrNull(value.bio) &&
    isOptionalStringOrNull(value.avatar) &&
    isOptionalStringOrNull(value.backgroundImage)
  );
};

const validateFriendLinkItems = (value: unknown, sourceLabel: string): FriendLinkItem[] => {
  if (!Array.isArray(value)) {
    throw new Error(`Friend link JSON from ${sourceLabel} must be an array`);
  }

  value.forEach((item, index) => {
    if (!isFriendLinkItem(item)) {
      throw new Error(`Friend link JSON from ${sourceLabel} has an invalid item at index ${index}`);
    }
  });

  return value;
};

export const normalizeFriendLinkItems = (items: FriendLinkItem[]): NormalizedFriendLinkItem[] =>
  items.map((item) => {
    const name = item.name.trim();
    const url = item.url.trim();
    const avatar = item.avatar?.trim() || null;
    const summary = item.bio?.trim() ?? '';
    const backgroundImageUrl = item.backgroundImage?.trim() ?? '';

    return {
      ...item,
      name,
      url,
      avatar,
      summary,
      backgroundImageUrl,
      hasBackgroundImage: backgroundImageUrl.length > 0,
      fallbackInitial: (name.charAt(0) || '?').toUpperCase(),
    };
  });

export const resolveFriendLinkItems = async (
  source: FriendLinkSource,
  fetcher: FriendLinkFetcher = fetch,
): Promise<FriendLinkItem[]> => {
  if (source.items) return source.items;

  const src = source.src?.trim();
  if (!src) return [];

  let response: Response;
  try {
    response = await fetcher(src);
  } catch (error) {
    throw new Error(
      `Failed to fetch friend links from ${src}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load friend links from ${src}: ${response.status} ${response.statusText}`,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      `Failed to parse friend links JSON from ${src}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return validateFriendLinkItems(data, src);
};

export const resolveFriendLinkItemsSafely = async (
  source: FriendLinkSource,
  fetcher: FriendLinkFetcher = fetch,
  logError: FriendLinkErrorLogger = (error) =>
    console.error('Failed to resolve friend link items:', error),
): Promise<FriendLinkItem[]> => {
  try {
    return await resolveFriendLinkItems(source, fetcher);
  } catch (error) {
    logError(error);
    return [];
  }
};
