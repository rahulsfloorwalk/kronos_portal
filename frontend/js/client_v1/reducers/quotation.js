
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.FIND_UNCOMPLETE_QUOTATION:
		return action.quotation;
	default:
		return state;
	}
};
