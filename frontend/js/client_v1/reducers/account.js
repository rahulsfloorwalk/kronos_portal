import types from "../action_types";

export default (state={balance: 0}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.FETCH_ACCOUNT_BALANCE:
		return {
			balance: action.balance
		};
	default:
		return state;
	}
};