import genYtUrl from './genYtUrl.mjs'

export default async(channelID, client, vidStat)=>{
    const videoUrl = genYtUrl(vidStat.vid, vidStat.t)

    const message = await client.rest.channels.createMessage(channelID, {
        content: `# A new video posted.\n${videoUrl}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        label: "Open",
                        type: 2,
                        url: videoUrl,
                        style: 5
                    },
                    {
                        type: 2,
                        label: "Watching",
                        style: 1,
                        customID: `watching_${vidStat.userID}`
                    },
                    {
                        type: 2,
                        label: "Remove",
                        style: 4,
                        customID: `vidDelete_${vidStat.userID}`
                    }
                ]
            }
        ]
    }).catch(()=>{})

    client.db.prepare('INSERT INTO videos (videoid, disocrdchannel, messageid, position, owner) VALUES(@videoid, @disocrdchannel, @messageid, @position, @owner)').run({
        videoid: vidStat.vid, 
        disocrdchannel: channelID,
        messageid: message.id,
        position: vidStat.t ?? 0,
        owner: vidStat.userID
    })
}