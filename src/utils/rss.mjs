import rssParser from "./rssParser.mjs";

export default async(channelid) => {
	const feed = await rssParser(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelid}`);

    return feed.items[0]
}