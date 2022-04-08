
import types from "../action_types";


const initialState = {
	auditCycle: {
		errors: {}
	},
	store: {
		errors: {},
	},
	section: {
		errors: {},
	},
	audit: {
		errors: {}
	}
};

export default (state=initialState, action) => {
	if(action.status === "success") { return state; }
	switch(action.type){
	case types.AUDIT_CYCLE_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				auditCycle: Object.assign({}, state.auditCycle, {
					errors: action.errors
				})
			});
		}
		break;
	case types.AUDIT_CYCLE_ID_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				auditCycle: Object.assign({}, state.auditCycle, {
					errors: action.errors
				})
			});
		}
		break;
	case types.STORE_POST:
		switch(action.status){
		case "error":
			return Object.assign({}, state, {
				store: Object.assign({}, state.store, {
					errors: action.errors
				})
			});
		}
		break;
	case types.STORE_ID_POST:
		switch(action.status){
		case "error":
			return Object.assign({}, state, {
				store: Object.assign({}, state.store, {
					errors: action.errors
				})
			});
		}
		break;
	case types.AUDIT_POST:
		switch(action.status){
		case "request":
			return  Object.assign({}, state, {
				audit: Object.assign({}, state.audit, {
					errors: {}
				})
			});
		case "error":
			return  Object.assign({}, state, {
				audit: Object.assign({}, state.audit, {
					errors: action.errors
				})
			});
		}
		break;
	case types.AUDIT_ID_POST:
		switch(action.status){
		case "request":
			return Object.assign({}, state, {
				audit: Object.assign({}, state.audit, {
					errors: {}
				})
			});
		case "error":
			return Object.assign({}, state, {
				audit: Object.assign({}, state.audit, {
					errors: action.errors
				})
			});
		}
		break;
	case types.RESET_FORM_ERRORS:
		return initialState;
	case types.SET_FORM_ERRORS:
		return Object.assign({}, initialState, {
			errors: action.errors,
		});
	default:
		return state;
	}
	console.warn("WARNING: default case encountered for action: %O", action);
	return state;
};



export const resetFormErrors = () => {
	return {
		type: types.RESET_FORM_ERRORS,
	};
};

export const setFormErrors = (errors) => {
	return {
		type: types.SET_FORM_ERRORS,
		errors,
	};
};
