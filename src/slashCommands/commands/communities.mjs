import urlExtract from '../../utils/urlExtract.mjs'
import rssParser from "../../utils/rssParser.mjs";
import postToDiscord from '../../utils/rdtPost.mjs'

const allowedRdditDomains = ["reddit.com", "www.reddit.com"]

export default {
    name: "communities",
    commandLogic: async (interaction, client) => {
        switch (interaction.data.options.raw[0].name){
            case "add":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value)

                if (!allowedRdditDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a reddit domain`
                    }
                }).catch(() => {});
                if (urlObject.pathname[0] !== 'r') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is malformed`
                    }
                }).catch(() => {});

                const rdtSubID = urlObject.pathname[1]

                const feed = await rssParser(`https://www.reddit.com/r/${rdtSubID}/new.rss`)
                if (feed.error) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `An error has occured. Error code: ${feed.code}`
                    }
                }).catch(() => {});

                client.db.prepare('INSERT OR IGNORE INTO subs (sub, lastpost, subname, lastupdated) VALUES (@sub, @lastpost, @subname, @lastupdated)').run({
                    sub: rdtSubID,
                    lastpost: feed.entry[0].id,
                    subname: feed.title,
                    lastupdated: new Date(feed.updated).toISOString()
                })

                client.db.prepare('INSERT OR IGNORE INTO communitiessubs (sub, disocrdchannel, owner) VALUES (@sub, @disocrdchannel, @owner)').run({
                    sub: rdtSubID,
                    disocrdchannel: interaction.channelID,
                    owner: interaction.user.id
                })

                postToDiscord(interaction.channelID, client, {pid: feed.entry[0].id, cid:'', sub:rdtSubID, userID:interaction.user.id})

                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `added: https://reddit.com/r/${rdtSubID}`
                    }
                }).catch(() => {});
            }
            break;
            case "remove":{
                const urlObject = urlExtract(interaction.data.options.raw[0].options[0].value)
               
                if (!allowedRdditDomains.includes(urlObject.host)) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is not a reddit domain`
                    }
                }).catch(() => {});
                if (urlObject.pathname[0] !== 'r') return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: `URL is malformed`
                    }
                }).catch(() => {});

                const rdtSubID = urlObject.pathname[1]

                const {owner} = client.db.prepare('SELECT owner FROM communitiessubs WHERE sub = @sub AND disocrdchannel = @disocrdchannel').get({
                    sub: rdtSubID,
                    disocrdchannel: interaction.channelID
                })
                if (owner && owner !== interaction.user.id) return client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        flags: 64,
                        content: "You are not allowed to remove this community. You must be the person who added the community."
                    }
                }).catch(() => {});
                
                client.db.prepare('DELETE FROM communitiessubs WHERE sub = @sub AND disocrdchannel = @disocrdchannel AND owner = @owner').run({
                    sub: rdtSubID,
                    disocrdchannel: interaction.channelID,
                    owner: interaction.user.id
                })
                client.rest.interactions.createInteractionResponse(interaction.id, interaction.token, {
                    type: 4,
                    data: {
                        content: `removed: https://reddit.com/r/${rdtSubID}`
    
                    }
                }).catch(() => {});
            }
            break;
            case "list": {
                const sublist = client.db.prepare('SELECT sub, owner, subname FROM communitiessubs INNER JOIN subs ON subs.sub = communitiessubs.sub WHERE communitiessubs.disocrdchannel = @disocrdchannel').all({
                    disocrdchannel: interaction.channelID
                })

                const messageContent = `# (${sublist.length}) Communities\n` + sublist.map(channel=>`- [${channel.subname}](<https://reddit.com/r/${channel.sub}>)`).join('\n')
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
    description: "Veiw and edit reddit communities to follow",
    options: [
        {
            "name": "add",
            "description": "Add a community to monitor",
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
            "description": "removes a community to monitor",
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
            "description": "Lists the monitored communities",
            "type": 1
        }
    ]
}
