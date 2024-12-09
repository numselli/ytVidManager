import vidDelete from "./interactions/vidDelete.mjs";
import watching from './interactions/watching.mjs'
// import tagAdd from './interactions/tagAdd.mjs'
// import tagRemove from './interactions/tagRemove.mjs'
// import addSelectedTag from './interactions/addSelectedTag.mjs'
// import removeSelectedTag from './interactions/removeSelectedTag.mjs'
// import manageTags from './interactions/manageTags.mjs'
import setTimeStamp from './interactions/setTimeStamp.mjs'

const files = [vidDelete, watching, setTimeStamp
	// , tagAdd, tagRemove, addSelectedTag, removeSelectedTag, manageTags
];

export default new Map(
	files.map((file) => {
		return [file.name, file];
	}),
);