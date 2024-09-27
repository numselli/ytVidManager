import { genYtUrl } from './genYtUrl.mjs'

export const postToDiscord = async(disocrdChannel, client, lastRSS)=>{
    const videoUrl = genYtUrl(lastRSS.videoID)

    client.rest.channels.createMessage(disocrdChannel, {
        content: `# ${lastRSS.author} posted a new video\n${videoUrl}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        label: "Open",
                        type: 2,
                        url: videoUrl,
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