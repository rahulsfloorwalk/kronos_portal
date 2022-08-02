import {combineReducers} from "redux";

import auditCycleReducer from "./audit_cycle.js";
import formsReducer from "./forms.js";
import clientReducer from "./client.js";
import storeReducer from "./store.js";
import countryReducer from "./country.js";
import stateReducer from "./state.js";
import cityReducer from "./city.js";
import clientUserReducer from "./client_user.js";
import clientUserStoreVisibilityReducer from "./client_user_visibility.js";
import sectionReducer from "./section.js";
import AuditReduer from "./audit.js";
import AccountReducer from "./account.js";
import QuotationReducer from "./quotation.js";

export default combineReducers({
	auditCycles: auditCycleReducer,
	forms: formsReducer,
	client: clientReducer,
	stores: storeReducer,
	countries: countryReducer,
	states: stateReducer,
	cities: cityReducer,
	clientUsers: clientUserReducer,
	clientUserStoreVisibility: clientUserStoreVisibilityReducer,
	sections: sectionReducer,
	audits: AuditReduer,
	account: AccountReducer,
	quotation: QuotationReducer,
});

