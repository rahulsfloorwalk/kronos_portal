import { FETCH_SECTIONS } from "../action_types.js";

const initialState = {};

export default (state=initialState, action) => {
	switch(action.type){
	case FETCH_SECTIONS:
		return Object.assign({}, state, {
			[action.auditStoreId]: action.sections,
		});
	default:
		return state;
	}
};

export const findSection = (store, auditStoreId, sectionId) => {
	return findSectionsByAuditStoreId(store, auditStoreId).find((s) => s.id === sectionId);
};

export const findSectionsByAuditStoreId = (store, auditStoreId) => {
	return store.sections[auditStoreId] || [];
};
