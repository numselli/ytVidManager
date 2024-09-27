export const postToDiscord = (disocrdChannel, client, lastRSS)=>{
    return client.rest.channels.createMessage(disocrdChannel, {
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