
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.STORE_GET:
		return ((stores) => {
			const obj = {};
			for( const s of stores){
				obj[s.id] = s;
			}
			return obj;
		})(action.stores);
	case types.STORE_ID_GET:
	case types.STORE_UPDATED:
		return Object.assign({}, state, {
			[action.store.id]: action.store,
		});
	case types.STORE_POST:
		return Object.assign({}, state, {
			[action.store.id]: action.store,
		});
	case types.STORE_ID_POST:
		return Object.assign({}, state, {
			[action.store.id]: action.store,
		});
	case types.STORE_ID_DELETE:
		return ((stores, storeId) => {
			const obj = {};
			for( const id in stores){
				if(parseInt(id) !== parseInt(storeId)){
					obj[id] = stores[id];
				}
			}
			return obj;
		})(state, action.storeId);
	default:
		return state;
	}
};
