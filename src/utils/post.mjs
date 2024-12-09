import genPostMessage from './genPostMessage.mjs'

export default async(disocrdChannel, client, videoID, t)=>{
    const message = await client.rest.channels.createMessage(disocrdChannel, await genPostMessage(videoID, t))

    client.db.prepare('INSERT INTO videos (videoid, disocrdchannel, messageid, position) VALUES(@videoid, @disocrdchannel, @messageid, @position)').run({
        videoid: videoID, 
        disocrdchannel: disocrdChannel,
        messageid: message.id,
        position: t ?? 0
    })
}