export default (url) => {
    const domainRaw = url.replace("https://", '').replace("http://", '')
    const domain = domainRaw.split('/')[0]
    const path = domainRaw.split("/")[1].split("?")[0]
    const query = parseQuery(domainRaw.split("?")?.[1])

    return {
        host: domain, 
        pathname: path,
        query: query
    }
}

// taken and heavily modified from https://github.com/ljharb/qs
const decode = (str) => {
    let strWithoutPlus = str.replace(/\+/g, ' ');
    try {
        return decodeURIComponent(strWithoutPlus);
    } catch (e) {
        return strWithoutPlus;
    }
};
function parseQuery(query){
    if (!query) return null;

    const parts = query.split("&");

    let obj = { __proto__: null };

    for (let i = 0; i < parts.length; ++i) {
        const part = parts[i];

        const pos = part.indexOf('=');

        let key;
        let val;
        if (pos === -1) {
            key = decode(part);
            val = '';
        } else {
            key = decode(part.slice(0, pos));

            if (key !== null) {
                val = decode(
                    part.slice(pos + 1)
                );
            }
        }

        if (key !== null) {
            obj[key] = Object.prototype.hasOwnProperty.call(obj, key) ? [].concat(obj[key], val) : val
        }
    }

    return obj;
}