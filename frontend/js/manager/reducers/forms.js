
import types from "../action_types";


const initialState = {
	client: {
		initialValues:{},
		errors: {}
	},
	location: {
		initialValues:{},
		errors: {}
	},
	audit: {
		errors: {}
	},
	auditCycle: {
		errors: {}
	},
	auditLocation: {
		errors: {}
	},
	applicationAssign: {
		errors: {}
	},
	applicationReject: {
		errors: {}
	},
	applicationComplete: {
		errors: {}
	},
	applicationFail: {
		errors: {}
	},
	auditorSearch: {
		search: "",
	},
	store: {
		errors: {},
	},
	section: {
		errors: {},
	},
	clientUser: {
		errors: {},
	},
};

export default (state=initialState, action) => {
	if(action.status === "success") { return state; }
	switch(action.type){
	case types.CLIENT_POST:
		switch (action.status) {
		case "error":
			return Object.assign({}, state, {
				client: Object.assign({}, state.client, {
					errors: action.errors
				})
			});
		}
		break;
	case types.CLIENT_ID_POST:
		switch (action.status) {
		case "error":
			return Object.assign({}, state, {
				client: Object.assign({}, state.client, {
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
	case types.SECTION_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				section: Object.assign({}, state.section, {
					errors: action.errors
				})
			});
		}
		break;
	case types.SECTION_ID_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				section: Object.assign({}, state.section, {
					errors: action.errors
				})
			});
		}
		break;
	case types.CLIENT_USER_FORM_LOAD:
		switch(action.status){
		case "request":
		case "success":
			return  Object.assign({}, state, {
				clientUser: Object.assign({}, state.clientUser, {
					errors: {}
				})
			});
		}
		break;
	case types.CLIENT_USER_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				clientUser: Object.assign({}, state.clientUser, {
					errors: action.errors
				})
			});
		}
		break;
	case types.CLIENT_USER_ID_POST:
		switch(action.status){
		case "error":
			return  Object.assign({}, state, {
				clientUser: Object.assign({}, state.clientUser, {
					errors: action.errors
				})
			});
		}
		break;
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
