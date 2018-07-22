import { FETCH_REPORT_SECTIONS, FETCH_REPORT_SECTION } from "../action_types.js";

export default (reportSections=[], action) => {
	switch(action.type){
	case FETCH_REPORT_SECTIONS: {
		return reportSections.concat(action.reportSections);
	}
	case FETCH_REPORT_SECTION: {
		const idx = reportSections.findIndex((rs) => rs.id === action.reportSection.id);
		if(idx < 0){
			return [...reportSections, action.reportSection];
		} else {
			return Object.assign([], reportSections, { [idx]: action.reportSection });
		}
	}
	default:
		return reportSections;
	}
};

export const findReportSection = (store, auditStoreId, sectionId) => {
	return store.reportSections.find((rs) => rs.audit_store_id === auditStoreId && rs.section_id === sectionId);
};
