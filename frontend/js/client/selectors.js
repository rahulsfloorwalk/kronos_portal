import { combineReducers } from "redux";

import questionnaireTypeReducer, { QuestionnaireTypeSelectors } from "./reducers/questionnaire_type";
import auditCycleReducer, { AuditCycleSelectors } from "./reducers/audit_cycle";
import reportBrowserReducer, { ReportBrowserSelectors } from "./reducers/report_browser";

const reducerMap = {};

reducerMap["questionnaireType"] = questionnaireTypeReducer;
export const questionnaireTypeSelectors = new QuestionnaireTypeSelectors("questionnaireType");

reducerMap["auditCycle"] = auditCycleReducer;
export const auditCycleSelectors = new AuditCycleSelectors("auditCycle", questionnaireTypeSelectors);

reducerMap["reportBrowser"] = reportBrowserReducer;
export const reportBrowserSelectors = new ReportBrowserSelectors("reportBrowser", auditCycleSelectors);

export default combineReducers(reducerMap);
