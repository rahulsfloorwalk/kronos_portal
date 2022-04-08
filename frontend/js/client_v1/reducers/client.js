
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.FETCH_CLIENT:
		return action.client;
	default:
		return state;
	}
};
