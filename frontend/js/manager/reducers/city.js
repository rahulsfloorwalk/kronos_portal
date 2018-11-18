import types from "../action_types";

export default (state=[], action) => {
	switch(action.type){
	case types.CITY_GET:
		switch(action.status){
		case "success":
			return action.cities;
		case "request":
			return [];
		}
		break;
	default:
		return state;
	}
};
