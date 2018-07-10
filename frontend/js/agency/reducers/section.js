import { FETCH_SECTIONS } from "../action_types.js";

export default (sections=[], action) => {
	switch(action.type){
	case FETCH_SECTIONS:
		return sections.concat(action.sections);
	default:
		return sections;
	}
};
