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

  if (feedUrl.includes("youtube")){
    return {
      date: req.headers.get('date'),
      title: feed.title,
      items: Array.isArray(feed.entry) ? feed.entry.map(formatYTEntry) : [formatYTEntry(feed.entry)]
    }
  } else {
    return {
      updated: feed.updated,
      title: feed.title,
      entry: Array.isArray(feed.entry) ? feed.entry.map(formatRdtEntry) : [formatRdtEntry(feed.entry)]
    }
  }
}

const formatYTEntry = (item) => {
  return {
    title: item.title,
    id: item['yt:videoId'],
    published: item.published
  }
}
const formatRdtEntry = (item) => {
  return {
    title: item.title,
    id: item.id,
    published: item.published,
  }
}