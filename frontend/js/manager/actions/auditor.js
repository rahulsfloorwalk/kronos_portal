import types from "../action_types.js";

export function setAuditorSearch(search){
	return {
		type: types.AUDITOR_SEARCH,
		status: "request",
		search
	};
}

