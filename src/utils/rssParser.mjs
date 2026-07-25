import XMLParser from "./fast-xml-parser/xmlparser/XMLParser.mjs";

const parser = new XMLParser();

let redditBlockedUntil = 0;
const REDDIT_USER_AGENT = 'discord:ytVidManager:1.0.0 (by /u/ytVidManager)';
const isRedditFeed = (url) => url.includes('reddit.com')
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRetryAfterMs = (headers) => {
  const raw = headers.get('retry-after') ?? headers.get('x-ratelimit-reset');
  const seconds = Number(raw);
  if (!raw || Number.isNaN(seconds) || seconds <= 0) return 60_000;
  return seconds * 1000;
}

export default async (feedUrl, { waitOutRateLimit = true } = {}) => {
  const isReddit = isRedditFeed(feedUrl);

  if (isReddit) {
    const now = Date.now();
    if (now < redditBlockedUntil) {
      if (!waitOutRateLimit) return {
        error: true,
        code: 429,
        retryAfter: (redditBlockedUntil - now),
        rateLimited: true
      };
      await sleep(redditBlockedUntil - now);
    }
  }

  let req;
  try {
    req = await fetch(feedUrl, {
      headers: {
        'User-Agent': isReddit ? REDDIT_USER_AGENT : 'rss-parser',
        'Accept': 'application/rss+xml',
      }
    })
  } catch (error) {
    return { error: true, code: 'FETCH_FAILED', message: error.message }
  }

  if (isReddit && req.status === 429) {
    const retryAfterMs = getRetryAfterMs(req.headers);
    redditBlockedUntil = Date.now() + retryAfterMs;
    return {
      error: true,
      code: 429,
      retryAfter: retryAfterMs,
      rateLimited: true
    }
  }

  if (req.status !== 200) return {error: true, code: req.status}

  const xml = await req.text()
  const { feed } = parser.parse(xml);

  if (feedUrl.includes("youtube")){
    return {
      date: req.headers.get('date'),
      title: feed.title,
      items: feed.entry ? (Array.isArray(feed.entry) ? feed.entry.map(formatYTEntry) : [formatYTEntry(feed.entry)]).filter(a=>a) : []
    }
  }

  return {
    updated: feed.updated,
    title: feed.title,
    entry: (Array.isArray(feed.entry) ? feed.entry.map(formatRdtEntry) : [formatRdtEntry(feed.entry)]).filter(a=>a)
  }
}

const formatYTEntry = (item) => {
  const id = Array.isArray(item['yt:videoId']) ? item['yt:videoId'][0] : item['yt:videoId'];
  
  return {
    title: item.title,
    id,
    published: item.published
  }
}
const formatRdtEntry = (item) => {
  if (!item) return null;
  return {
    title: item.title,
    id: item.id,
    published: item.published,
  }
}
