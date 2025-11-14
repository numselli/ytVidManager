import rssParser from "../../utils/rssParser.mjs";
import postToDiscord from "../../utils/post.mjs"
import urlExtract from "../../utils/urlExtract.mjs";

const allowedYtDomains = ["youtu.be", "www.youtube.com", "youtube.com", "m.youtube.com"]

export default {
    name: "channel",
    commandLogic: async (interaction, client) => {
        switch (interaction.data.options.raw[0].name){
            case "add":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value);
                if (!allowedYtDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a youtube domain`
                    }
                }).catch(() => {});
                if (urlObject.pathname.includes("@")) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: '@usernames are not currently supported. Use `https://youtube.com/channel/<channel_id>`. To get the channel id, open the channel on youtube, click on `More about this channel ...more`, then click `Share channel` at the bottom, then click `Copy channel ID`'
                    }
                }).catch(() => {});

                const ytChannelID = urlObject.pathname

                const feed = await rssParser(`https://www.youtube.com/feeds/videos.xml?channel_id=${ytChannelID}`)
                if (feed.error) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `An error has occured. Error code: ${feed.code}`
                    }
                }).catch(() => {});

                client.db.prepare('INSERT OR IGNORE INTO ytchannels (channelid, lastvid, channelname, expires) VALUES (@channelid, @lastvid, @channelname, @expires)').run({
                    channelid: ytChannelID,
                    lastvid: feed.items[0].id,
                    channelname: feed.title,
                    expires: new Date(feed.expires).toISOString()
                })

                client.db.prepare('INSERT OR IGNORE INTO channelsubs (ytchannelid, disocrdchannel, owner) VALUES (@ytchannelid, @disocrdchannel, @owner)').run({
                    ytchannelid: ytChannelID,
                    disocrdchannel: interaction.channelID,
                    owner: interaction.user.id
                })

                postToDiscord(interaction.channelID, client, {vid: feed.items[0].id, userID: interaction.user.id})

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `added: https://youtube.com/channel/${ytChannelID}`
                    }
                }).catch(() => {});
            }
            break;
            case "remove":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value);
                if (!allowedYtDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a youtube domain`
                    }
                }).catch(() => {});
                if (urlObject.pathname.includes("@")) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: '@usernames are not currently supported. Use `https://youtube.com/channel/<channel_id>`. To get the channel id, open the channel on youtube, click on `More about this channel ...more`, then click `Share channel` at the bottom, then click `Copy channel ID`'
                    }
                }).catch(() => {});

                const ytChannelID = urlObject.pathname

                const {owner} = client.db.prepare('SELECT owner FROM channelsubs WHERE ytchannelid = @ytchannelid AND disocrdchannel = @disocrdchannel').get({
                    ytchannelid: ytChannelID,
                    disocrdchannel: interaction.channelID
                })
                if (owner && owner !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "You are not allowed to remove this channel. You must be the person who added the channel."
                    }
                }).catch(() => {});
                
                client.db.prepare('DELETE FROM channelsubs WHERE ytchannelid = @ytchannelid AND disocrdchannel = @disocrdchannel AND owner = @owner').run({
                    ytchannelid: ytChannelID,
                    disocrdchannel: interaction.channelID,
                    owner: interaction.user.id
                })
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `removed: https://youtube.com/channel/${ytChannelID}`
    
                    }
                }).catch(() => {});
            }
            break;
            case "list": {
                const sublist = client.db.prepare('SELECT ytchannelid, owner, channelname FROM channelsubs INNER JOIN ytchannels ON ytchannels.channelid = channelsubs.ytchannelid WHERE channelsubs.disocrdchannel = @disocrdchannel').all({
                    disocrdchannel: interaction.channelID
                })

                const messageContent = `# (${sublist.length})Youtube channels\n` + sublist.map(channel=>`- [${channel.channelname}](<https://youtube.com/channel/${channel.ytchannelid}>)`).join('\n')
                const messageParts = messageContent.match(/[\s\S]{1,2000}$/gm);

                if (messageParts.length === 1) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: messageContent
                    }
                }).catch(() => {});

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: messageParts[0]
                    }
                }).catch(() => {});

                messageParts.forEach((element, index) => {
                    if (index === 0) return;
                    client.rest.channels.createMessage(interaction.channelID, {
                        content: element
                    })
                });
            }
            break;
        }
    },
    description: "Veiw and edit yt channel subscriptions",
    options: [
        {
            "name": "add",
            "description": "Add a youtube channel to monitor",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt channel ID you want to subscribe to.",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "remove",
            "description": "removes a youtube channel to monitor",
            "type": 1,
			"options":[
                {
                    "name": "id",
                    "description": "The yt channel ID you want to unsubscribe from",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "list",
            "description": "Lists the monitored youtube channels",
            "type": 1
        }
    ]
}
