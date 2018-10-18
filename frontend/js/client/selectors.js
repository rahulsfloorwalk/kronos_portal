import { combineReducers } from "redux";

import questionnaireTypeReducer from "./reducers/questionnaire_type";
import QuestionnaireTypeSelectors from "./selectors/questionnaire_type";

import auditCycleReducer from "./reducers/audit_cycle";
import AuditCycleSelectors from "./selectors/audit_cycle";

import reportBrowserReducer from "./reducers/report_browser";
import ReportBrowserSelectors from "./selectors/report_browser";

const reducerMap = {};

reducerMap["questionnaireType"] = questionnaireTypeReducer;
export const questionnaireTypeSelectors = new QuestionnaireTypeSelectors("questionnaireType");

reducerMap["auditCycle"] = auditCycleReducer;
export const auditCycleSelectors = new AuditCycleSelectors("auditCycle", questionnaireTypeSelectors);

reducerMap["reportBrowser"] = reportBrowserReducer;
export const reportBrowserSelectors = new ReportBrowserSelectors("reportBrowser", auditCycleSelectors);

export default combineReducers(reducerMap);
