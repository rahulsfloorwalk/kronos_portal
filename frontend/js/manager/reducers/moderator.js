
import types from "../action_types";

export default (state=[], action) => {
	switch(action.type){
	case types.MODERATOR_GET:
		return action.moderators;
	default:
		return state;
	}
};

