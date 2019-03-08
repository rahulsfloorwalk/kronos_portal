
import types from "../action_types";

export default (state={}, action) => {
	switch(action.type){
	case types.MODERATOR_SUMMARY:
		return action.moderatorSummary;
	default:
		return state;
	}
};

