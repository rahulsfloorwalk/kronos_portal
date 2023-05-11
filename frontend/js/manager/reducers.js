import { combineReducers } from "redux";

import applicationReducer from "./reducers/application";
import auditReducer from "./reducers/audit";
import auditStoreReducer from "./reducers/audit_store";
import auditCycleReducer from "./reducers/audit_cycle";
import clientReducer from "./reducers/client";
import storeReducer from "./reducers/store";
import sectionReducer from "./reducers/section";
import countryReducer from "./reducers/country";
import stateReducer from "./reducers/state";
import cityReducer from "./reducers/city";
import answerReducer from "./reducers/answer";
import reportSectionReducer from "./reducers/report_section";
import clientUserReducer from "./reducers/client_user";
import clientUserStoreVisibilityReducer from "./reducers/client_user_visibility";
import reportAttributeReducer from "./reducers/report_attribute";
import auditCycleModeratorSummaryReducer from "./reducers/audit_cycle_moderator_summary";
import formReducer from "./reducers/forms";
import errorsReducer from "./reducers/errors";
import moderatorReducer from "./reducers/moderator";
import moderatorSummaryReducer from "./reducers/moderator_summary";
import permissionReducer from "./reducers/permission";
import remainingStoreReducer from "./reducers/remaining_store";
export default combineReducers({
	applications: applicationReducer,
	audits: auditReducer,
	auditStores: auditStoreReducer,
	auditCycles: auditCycleReducer,
	clients: clientReducer,
	stores: storeReducer,
	sections: sectionReducer,
	countries: countryReducer,
	states: stateReducer,
	cities: cityReducer,
	answers: answerReducer,
	reportSections: reportSectionReducer,
	clientUsers: clientUserReducer,
	clientUserStoreVisibility: clientUserStoreVisibilityReducer,
	reportAttributes: reportAttributeReducer,
	auditCycleModeratorSummary: auditCycleModeratorSummaryReducer,
	forms: formReducer,
	errors: errorsReducer,
	moderator: moderatorReducer,
	moderatorSummary: moderatorSummaryReducer,
	permissions: permissionReducer,
	remainingStore:remainingStoreReducer,
});

