const { ytKey } = await import(process.env.NODE_ENV === "production" ? "/static/settings.mjs" : "./static/settings.mjs");

export default async channelID => {
    const playlistId = `${channelID.slice(0, 1)}U${channelID.slice(2)}`

    const rawFetch = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2CcontentDetails&maxResults=50&key=${ytKey}&playlistId=${playlistId}`)
    const fetchJson = await rawFetch.json()

    const date = new Date()

    return {
        date,
        title: fetchJson.items[0].snippet.videoOwnerChannelTitle,
        items: fetchJson.items.map(item=>{
            return {
                title: item.snippet.title,
                id: item.snippet.resourceId.videoId,
                published: item.snippet.publishedAt
            }
        })
    }
}