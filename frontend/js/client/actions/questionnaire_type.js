import * as questionnaireType from "../service/questionnaire_type.js";
import * as questionnaireTypeActionCreators from "../reducers/questionnaire_type";
import * as reportBrowserActionCreators from "../reducers/report_browser";

export function fetchQuestionnaireTypes(){
	return function(dispatch){
		return questionnaireType.fetchQuestionnaireTypes().then((questionnaireTypes) => {
			dispatch(questionnaireTypeActionCreators.fetchQuestionnaireTypes(questionnaireTypes));
		});
	};
}


export function selectQuestionnaireType(selectedQuestionnaireTypeId){
	return function(dispatch){
		dispatch(questionnaireTypeActionCreators.selectQuestionnaireType(selectedQuestionnaireTypeId));
		dispatch(reportBrowserActionCreators.resetDependentFilters());
	};
}

