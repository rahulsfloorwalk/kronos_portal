import { FETCH_SECTIONS } from "../action_types.js";
import * as section from "../service/section.js";

export function fetchSections(auditStoreId){
	return function(dispatch){
		return section.fetchSections(auditStoreId).then((sections) => {
			dispatch({
				type: FETCH_SECTIONS,
				sections,
				auditStoreId,
			});
		});
	};
}

