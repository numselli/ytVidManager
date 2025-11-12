import genRdtUrl from './genRdtUrl.mjs'

export default (pid, sub, cid, userID)=>{
    const postUrl = genRdtUrl(pid, sub, cid)

    return {
        content: `# A new posted has been made.\n${postUrl}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        label: "Open",
                        type: 2,
                        url: postUrl,
                        style: 5
                    },
                    {
                        type: 2,
                        label: "Remove",
                        style: 4,
                        customID: `rdtPostDelete_${userID}`
                    }
                ]
            }
        ]
    }
}