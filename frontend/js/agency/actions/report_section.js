import { FETCH_REPORT_SECTIONS, FETCH_REPORT_SECTION } from "../action_types.js";
import * as reportSection from "../service/report_section.js";

export function fetchReportSections(auditStoreId){
	return function(dispatch){
		return reportSection.fetchReportSections(auditStoreId).then((reportSections) => {
			dispatch({
				type: FETCH_REPORT_SECTIONS,
				reportSections,
				auditStoreId,
			});
		});
	};
}


export function setAuditorComment(auditStoreId, sectionId, auditorComment){
	return function(dispatch){
		return reportSection.setAuditorComment(auditStoreId, sectionId, auditorComment).then((reportSection) => {
			dispatch({
				type: FETCH_REPORT_SECTION,
				auditStoreId,
				sectionId,
				reportSection,
			});
		});
	};
}

