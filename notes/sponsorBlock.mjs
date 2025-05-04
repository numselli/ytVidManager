// length, adlength
export const getTotalAdLength = async(videoID) => {
    const rawFetch = await fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${videoID}`)

    if (rawFetch.status === 404) return 0

    const skipSegments = await rawFetch.json()

    const totalAdLength = skipSegments.map(skipSegment => 
        skipSegment.segment.reverse().reduce((accumulator, item) =>  accumulator - item))
        .reduce((total, num) => total + num, 0)

    return totalAdLength
}