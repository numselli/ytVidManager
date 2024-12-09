export default urlObj => {
    const ytInfo = {
        vid: '',
        t: urlObj.query.t ?? 0
    }

    if (urlObj.query.v) ytInfo.vid = urlObj.query.v
    if (urlObj.host === "youtu.be") ytInfo.vid = urlObj.pathname.substring(1)
    if (urlObj.pathname === "/shorts") ytInfo.vid = urlObj.pathname.split("/")[2]

    return ytInfo
}