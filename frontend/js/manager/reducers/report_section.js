
import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
	case types.REPORT_SECTION_GET:
		return ((reportSections) => {
			const obj = {};
			for( const r of reportSections){
				obj[r.id] = r;
			}
			return obj;
		})(action.reportSections);
	case types.REPORT_SECTION_PM_COMMENT:
	case types.REPORT_SECTION_AUDITOR_COMMENT:
	case types.REPORT_SECTION_NOT_APPLICABLE:
		return Object.assign({}, state, {
			[action.reportSection.id]: action.reportSection,
		});
	default:
		return state;
	}
};
