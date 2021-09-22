import types from "../action_types";

export default (state=[], action) => {
	switch(action.type){
	case types.PERMISSIONS_GET:
		return action.payload;
	default:
		return state;
	}
};
