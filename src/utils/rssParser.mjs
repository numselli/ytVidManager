// "fast-xml-parser": "^4.5.4",
import XMLParser from "./fast-xml-parser/xmlparser/XMLParser";

const parser = new XMLParser();
let redditBlockedUntil = 0;
const isRedditFeed = (url) => url.includes('reddit.com')

export default async (feedUrl) => {
  const now = Date.now();

  if (isRedditFeed(feedUrl) && now < redditBlockedUntil) return {
    error: true,
    code: 429,
    retryAfter: (redditBlockedUntil - now),
    rateLimited: true
  };

  const req = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'rss-parser',
      'Accept': 'application/rss+xml',
    }
  })

  if (isRedditFeed(feedUrl) && req.status === 429) {
    const retryAfterHeader = req.headers.get('x-ratelimit-reset');
    redditBlockedUntil = now + Number(retryAfterHeader);
    return {
      error: true,
      code: 429,
      retryAfter: retryAfterHeader,
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
