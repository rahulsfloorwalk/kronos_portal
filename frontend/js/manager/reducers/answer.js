
import types from "../action_types";

export default (state={}, action) => {
	switch(action.type){
		case types.ANSWER_GET:
			switch(action.status){
				case "request":
					return Object.assign({}, state, {
						answers: {}
					});
					break;
				case "success":
					return ((answers) => {
						const obj = {};
						for( const a of answers){
							obj[a.id] = a;
						}
						return obj;
					})(action.answers);
					break;
			}
			break;
		case types.ANSWER_MARK:
		case types.ANSWER_NOT_APPLICABLE:
			if(action.status !== "success") { return state; }
			return Object.assign({}, state, {
				[action.answer.id]: action.answer,
			});
			break;
		default:
			return state;
	}
};

