export default (videoID, time)=>{
    return `https://youtube.com/watch?v=${videoID}${time ? `&t=${time}` : ''}`
}