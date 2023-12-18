import Parser from 'rss-parser';

const parser = new Parser();

export const fetchFromRSS = async(channelid) => {
	const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelid}`);

    return feed.items[0]
}

export const postChannelYtVid = async(row, client) => {
    const lastRSS = await fetchFromRSS(row.channelid)
    const vidID = lastRSS.id.replace("yt:video:", "")

    if (vidID === row.lastvid) return;
    client.db.prepare('UPDATE channels SET lastvid = @lastvid, channelname = @channelname WHERE channelid = @channelid)').run({
        channelid: row.channelid,
        lastvid: vidID,
        channelname: lastRSS.author
    })

    postToDiscord(row.disocrdchannel, client, lastRSS)
}


export const postToDiscord = (disocrdChannel, client, lastRSS)=>{
    client.rest.channels.createMessage(disocrdChannel, {
        content: `# ${lastRSS.author} posted a new video\n${lastRSS.link}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        label: "Open",
                        type: 2,
                        url: lastRSS.link,
                        style: 5,
                    },
                    {
                        type: 2,
                        label: "Watching",
                        style: 1,
                        customID: "watching",
                    },
                    {
                        type: 2,
                        label: "Manage tags",
                        style: 1,
                        customID: "manageTags",
                    },
                    {
                        type: 2,
                        label: "Remove",
                        style: 4,
                        customID: "vidDelete",
                    },
                ]
            }
        ]
    })
}

fetchFromRSS("UCsKVP_4zQ877TEiH_Ih5yDQ")