import { Parser } from 'xml2js'
// taken and heavily modified from https://github.com/rbren/rss-parser

const DEFAULT_HEADERS = {
  'User-Agent': 'rss-parser',
  'Accept': 'application/rss+xml',
}

const xmlParser = new Parser();

export default class rssParser {
  constructor() {
  }

  parseString(xml) {
    let prom = new Promise((resolve, reject) => {
      xmlParser.parseString(xml, (err, result) => {
        if (err) return reject(err);
        if (!result) {
          return reject(new Error('Unable to parse XML.'));
        }
        let feed = this.buildAtomFeed(result);

        resolve(feed);
      });
    });

    return prom;
  }

  async parseURL(feedUrl) {
    const req = await fetch(feedUrl, {
      headers: DEFAULT_HEADERS
    })

    if (req.status !== 200) return new Error("Status code " + req.status)

    const xml = await req.text()

    return {
      date: req.headers.get('date'),
      expires: req.headers.get('expires'),
      ... await this.parseString(xml)
    }
  }

  buildAtomFeed(xmlObj) {
    return {
      title: xmlObj.feed.title[0],

      items: xmlObj.feed.entry.map(entry => {
        return {
          id: entry.id[0],
          title: entry.title[0],
          link: entry.link[0].$.href,
          pubDate: entry.published[0]
        }
      })
    }
  }
}
