import vidDelete from './interactions/vidDelete.mjs';
import watching from './interactions/watching.mjs'
import setTimeStamp from './interactions/setTimeStamp.mjs'
import postDelete from './interactions/postDelete.mjs'

const files = [vidDelete, watching, setTimeStamp, postDelete];

export default new Map(
	files.map((file) => {
		return [file.name, file];
	})
);