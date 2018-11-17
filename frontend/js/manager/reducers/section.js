import types from "../action_types";

export default (state={}, action) => {
	if(action.status !== "success") { return state; }
	switch(action.type){
		case types.SECTION_GET:
			return ((sections) => {
				const obj = {};
				for( const s of sections){
					obj[s.id] = s;
				}
				return obj;
			})(action.sections);
			break;
		case types.SECTION_ID_GET:
			return Object.assign({}, store.sections, {
				[action.section.id]: action.section,
			});
			break;
		case types.SECTION_POST:
			return Object.assign({}, store.sections, {
				[action.section.id]: action.section,
			});
			break;
		case types.SECTION_ID_POST:
			return Object.assign({}, store.sections, {
				[action.section.id]: action.section,
			});
			break;
		case types.SECTION_ID_DELETE:
			return ((sections, sectionId) => {
				const obj = {};
				for( const id in sections){
					if(parseInt(id) !== parseInt(sectionId)){
						obj[id] = sections[id];
					}
				}
				return obj;
			})(store.sections, action.sectionId);
			break;
		default:
			return state;
	}
};
