import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.COUNTRY_GET:
		return action.countries;
	default:
		return state;
	}
};