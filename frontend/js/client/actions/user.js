import * as userService from "../service/user";
import * as userActionCreators from "../reducers/user";

export function fetchUser(){
	return function(dispatch){
		return userService.fetchUser().then((user) => {
			dispatch(userActionCreators.fetchUser(user));
		});
	};
}

