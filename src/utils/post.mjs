import { getTotalAdLength } from './sponsorBlock.mjs'
import { genYtUrl } from './genYtUrl.mjs'
import { getVideoLength } from './getVideoLength.mjs'

export const postToDiscord = async(disocrdChannel, client, lastRSS)=>{
    const totalAdLength = await getTotalAdLength(lastRSS.videoID)
    const videoLength = await getVideoLength(lastRSS.videoID)

    const videoUrl = genYtUrl(lastRSS.videoID, lastRSS.position)

    const message = await client.rest.channels.createMessage(disocrdChannel, {
        content: `# A new video posted.\nLength: ${new Date(videoLength*1000).toISOString().slice(11, 19)} (${new Date(((videoLength-totalAdLength)*1000)).toISOString().slice(11, 19)}) (AD length:${new Date(totalAdLength*1000).toISOString().slice(11, 19)})\n${videoUrl}`,
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

    client.db.prepare('INSERT INTO videos (videoid, disocrdchannel, messageid, vidlength, adslength, position) VALUES(@videoid, @disocrdchannel, @messageid, @vidlength, @adslength, @position)').run({
        videoid: lastRSS.videoID, 
        disocrdchannel: disocrdChannel,
        messageid: message.id, 
        vidlength: videoLength, 
        adslength: totalAdLength,
        position: 0
    })
}