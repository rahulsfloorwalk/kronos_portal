import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
		case types.CLIENT_GET:
			return ((clients) => {
				const clientObj = {};
				for(const c of clients){
					clientObj[c.id] = c;
				}
				return clientObj;
			})(action.clients);
			break;
		case types.CLIENT_POST:
			return Object.assign({}, state, {
				[action.client.id]: action.client,
			});
			break;
		case types.CLIENT_ID_GET:
			return Object.assign({}, state, {
				[action.client.id]: action.client,
			});
			break;
		case types.CLIENT_ID_POST:
			return Object.assign({}, state, {
				[action.client.id]: action.client,
			});
			break;
		default:
			return state;
	}
};
