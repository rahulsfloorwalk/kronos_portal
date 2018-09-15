import { combineReducers } from "redux";

import questionnaireTypeReducer, { QuestionnaireTypeSelectors } from "./reducers/questionnaire_type";
import auditCycleReducer, { AuditCycleSelectors } from "./reducers/audit_cycle";

const reducerMap = {};

reducerMap["questionnaireType"] = questionnaireTypeReducer;
export const questionnaireTypeSelectors = new QuestionnaireTypeSelectors("questionnaireType");

reducerMap["auditCycle"] = auditCycleReducer;
export const auditCycleSelectors = new AuditCycleSelectors("auditCycle");

export default combineReducers(reducerMap);
