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
      items: (Array.isArray(feed.entry) ? feed.entry.map(formatYTEntry) : [formatYTEntry(feed.entry)]).filter(a=>a)
    }
  } else {
    return {
      updated: feed.updated,
      title: feed.title,
      entry: (Array.isArray(feed.entry) ? feed.entry.map(formatRdtEntry) : [formatRdtEntry(feed.entry)]).filter(a=>a)
    }
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