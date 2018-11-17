import { combineReducers } from "redux";

import types from "./action_types.js";

import applicationReducer from "./reducers/application";
import auditReducer from "./reducers/audit";
import auditStoreReducer from "./reducers/audit_store";
import auditCycleReducer from "./reducers/audit_cycle";
import clientReducer from "./reducers/client";
import storeReducer from "./reducers/store";
import sectionReducer from "./reducers/section";
import stateReducer from "./reducers/state";
import cityReducer from "./reducers/city";
import answerReducer from "./reducers/answer";
import reportSectionReducer from "./reducers/report_section";
import clientUserReducer from "./reducers/client_user";
import clientUserStoreVisibilityReducer from "./reducers/client_user_visibility";
import reportAttributeReducer from "./reducers/report_attribute";
import formReducer from "./reducers/forms";
import errorsReducer from "./reducers/errors";

var initialStore = {
	applications: {},
	audits: {},
	auditStores: {},
	auditCycles: {},
	clients: {},
	stores: {},
	sections: {},
	locations: {},
	states: {},
	cities: [],
	profileInfos: {},
	bankInfos: {},
	additionalInfos: {},
	socialInfos: {},
	answers: {},
	reportSections: {},
	clientUsers: {},
	clientUserStoreVisibility: {},
	reportAttributes: {},
	errors: {},
	forms: {
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
	}
};

const reducerMap = {
	applications: applicationReducer,
	audits: auditReducer,
	auditStores: auditStoreReducer,
	auditCycles: auditCycleReducer,
	clients: clientReducer,
	stores: storeReducer,
	sections: sectionReducer,
	states: stateReducer,
	cities: cityReducer,
	answers: answerReducer,
	reportSections: reportSectionReducer,
	clientUsers: clientUserReducer,
	clientUserStoreVisibility: clientUserStoreVisibilityReducer,
	reportAttributes: reportAttributeReducer,
	forms: formReducer,
	errors: errorsReducer,
};

export default combineReducers(reducerMap);
