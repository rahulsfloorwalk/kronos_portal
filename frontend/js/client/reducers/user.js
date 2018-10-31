import { FETCH_USER } from "../action_types";

const initialState = {
	user: undefined,
};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_USER:
		return Object.assign({}, state, {
			user: action.user,
		});
	default:
		return state;
	}
};

// Action Creators

export function fetchUser(user){
	return {
		type: FETCH_USER,
		user,
	};
}

