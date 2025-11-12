import genRdtPostMessage from "./genRdtPostMessage.mjs"

export default async(channelID, client, postStat)=>{
    const messageToSend = genRdtPostMessage(postStat.pid, postStat.sub, postStat.cid, postStat.userID)
    const message = await client.rest.channels.createMessage(channelID, messageToSend).catch(()=>{})

    client.db.prepare('INSERT INTO rdtposts (pid, cid, disocrdchannel, messageid, owner) VALUES(@pid, @cid, @disocrdchannel, @messageid, @owner)').run({
        pid: vidStat.pid, 
        cid: vidStat.cid,
        disocrdchannel: channelID,
        messageid: message.id,
        owner: vidStat.userID
    })
}