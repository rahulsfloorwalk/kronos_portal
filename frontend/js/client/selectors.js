import { combineReducers } from "redux";

import questionnaireTypeReducer from "./reducers/questionnaire_type";
import QuestionnaireTypeSelectors from "./selectors/questionnaire_type";

import auditCycleReducer from "./reducers/audit_cycle";
import AuditCycleSelectors from "./selectors/audit_cycle";

import reportBrowserReducer from "./reducers/report_browser";
import ReportBrowserSelectors from "./selectors/report_browser";

import loadingReducer from "./reducers/loading";
import LoadingSelectors from "./selectors/loading";

import reportAttributeReducer from "./reducers/report_attribute";
import ReportAttributeSelectors from "./selectors/report_attribute";

import userReducer from "./reducers/user";
import UserSelectors from "./selectors/user";

import FilterSelectors from "./selectors/filter";

const reducerMap = {};

reducerMap["questionnaireType"] = questionnaireTypeReducer;
export const questionnaireTypeSelectors = new QuestionnaireTypeSelectors("questionnaireType");

reducerMap["auditCycle"] = auditCycleReducer;
export const auditCycleSelectors = new AuditCycleSelectors("auditCycle", questionnaireTypeSelectors);

reducerMap["reportBrowser"] = reportBrowserReducer;
export const reportBrowserSelectors = new ReportBrowserSelectors("reportBrowser", auditCycleSelectors);

reducerMap["loading"] = loadingReducer;
export const loadingSelectors = new LoadingSelectors("loading");

reducerMap["user"] = userReducer;
export const userSelectors = new UserSelectors("user");

reducerMap["reportAttribute"] = reportAttributeReducer;
export const reportAttributeSelectors = new ReportAttributeSelectors("reportAttribute", auditCycleSelectors);

export const filterSelectors = new FilterSelectors("filters", reportBrowserSelectors, reportAttributeSelectors, auditCycleSelectors);

export default combineReducers(reducerMap);
