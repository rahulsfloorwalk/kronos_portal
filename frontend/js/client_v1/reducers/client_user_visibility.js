
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.CLIENT_USER_STORE_VISIBILITY:
		return Object.assign({}, state, {
			[action.storeId]: action.clientUsers,
		});
	default:
		return state;
	}
};
