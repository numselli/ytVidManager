export default urlObj => {
    const rdtInfo = {
        pid: '',
        cid: '',
        sub: ''
    }

    if (!urlObj.pathname.includes('r')) return rdtInfo
    if (!urlObj.pathname.includes('comments')) return rdtInfo

    rdtInfo.pid = urlObj.pathname[3]
    rdtInfo.cid = urlObj.pathname[5]
    rdtInfo.sub = urlObj.pathname[1]

    return rdtInfo
}
