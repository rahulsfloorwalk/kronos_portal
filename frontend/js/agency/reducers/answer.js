import { FETCH_ANSWERS } from "../action_types.js";

export default (answers=[], action) => {
	switch(action.type){
	case FETCH_ANSWERS:
		return action.answers;
	default:
		return answers;
	}
};
