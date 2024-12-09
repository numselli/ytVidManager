import Parser from 'rss-parser';

const parser = new Parser();

export default async(channelid) => {
	const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelid}`);

    return feed.items[0]
}