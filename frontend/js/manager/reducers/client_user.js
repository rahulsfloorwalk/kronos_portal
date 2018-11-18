import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.CLIENT_USER_GET:
		return ((clientUsers) => {
			const obj = {};
			for( const c of clientUsers){
				obj[c.id] = c;
			}
			return obj;
		})(action.clientUsers);
	case types.CLIENT_USER_POST:
		return Object.assign({}, state, {
			[action.clientUser.id]: action.clientUser,
		});
	case types.CLIENT_USER_ID_GET:
		return Object.assign({}, state, {
			[action.clientUser.id]: action.clientUser,
		});
	case types.CLIENT_USER_ID_POST:
		return Object.assign({}, state, {
			[action.clientUser.id]: action.clientUser,
		});
	default:
		return state;
	}
};
