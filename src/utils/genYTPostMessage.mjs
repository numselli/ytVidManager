import genYtUrl from './genYtUrl.mjs'

export default (videoID, position, userID)=>{
    const videoUrl = genYtUrl(videoID, position)

    return {
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
                        customID: `watching_${userID}`
                    },
                    {
                        type: 2,
                        label: "Remove",
                        style: 4,
                        customID: `vidDelete_${userID}`
                    }
                ]
            }
        ]
    }
}