import { combineReducers } from "redux";
import questionnaireTypeReducer from "./reducers/questionnaire_type";

import { QuestionnaireTypeSelectors } from "./reducers/questionnaire_type";

const reducerMap = {};

reducerMap["questionnaireType"] = questionnaireTypeReducer;
export const questionnaireTypeSelectors = new QuestionnaireTypeSelectors("questionnaireType");

export default combineReducers(reducerMap);
