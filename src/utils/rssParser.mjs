import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

export default async(feedUrl) => {
  const req = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'rss-parser',
      'Accept': 'application/rss+xml',
    }
  })

  if (req.status !== 200) return {error: true, code: req.status}

  const xml = await req.text()
  const { feed } = parser.parse(xml);

  return {
    date: req.headers.get('date'),
    expires: req.headers.get('expires'),
    title: feed.title,
    items: Array.isArray(feed.entry) ? feed.entry.map(formatEntry) : formatEntry(feed.entry)
  }
}

const formatEntry = (item) => {
  return {
    title: item.title,
    id: item['yt:videoId'],
    published: item.published
  }
}
