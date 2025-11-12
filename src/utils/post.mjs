import genPostMessage from '../../utils/genYTPostMessage.mjs'

export default async(channelID, client, vidStat)=>{
    const messageToSend = genPostMessage(vidStat.vid, vidStat.t, vidStat.userID)
    const message = await client.rest.channels.createMessage(channelID, messageToSend).catch(()=>{})

    client.db.prepare('INSERT INTO videos (videoid, disocrdchannel, messageid, position, owner) VALUES(@videoid, @disocrdchannel, @messageid, @position, @owner)').run({
        videoid: vidStat.vid, 
        disocrdchannel: channelID,
        messageid: message.id,
        position: vidStat.t ?? 0,
        owner: vidStat.userID
    })
}