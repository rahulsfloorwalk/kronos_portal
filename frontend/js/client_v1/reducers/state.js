import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.STATE_GET:
		return action.states;
	case types.STATE_GET_BY_COUNTRY:
		return action.states;
	default:
		return state;
	}
};
