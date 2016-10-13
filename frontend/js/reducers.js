import { types } from './actions'

var initialStore = {
	profileInfo: {},
	bankInfo: {},
	additionalInfo: {},
	forms: {
		profileInfo: {
			values:{},
			errors:{}
		}
	}
};

export function rootReducer(store, action) {
	if( typeof store === 'undefined'){
		return initialStore;
	}

	switch(action.type){
		case types.PROFILE_INFO_GET_REQ:
			return Object.assign({}, store, {
				loadingProfileInfo: true
			});
		case types.PROFILE_INFO_GET_SUC:
			return Object.assign({}, store, {
				loadingProfileInfo: false,
				profileInfo: Object.assign({}, store.profileInfo, action.profileInfo)
			});
		/* Profile Info Form Reducers */
		case types.PROFILE_INFO_POST_REQ:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					profileInfo:{
						values: action.profileInfo,
						errors: {}
					}
				})
			});
		case types.PROFILE_INFO_POST_SUC:
			return Object.assign({}, store, {
				profileInfo: action.profileInfo,
				forms: Object.assign({}, store.forms, {
					profileInfo: Object.assign({}, store.forms.profileInfo, {
						values: action.profileInfo,
						errors: {}
					})
				})
			});
		case types.PROFILE_INFO_POST_ERR:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					profileInfo: Object.assign({}, store.forms.profileInfo, {
						errors: action.errors
					})
				})
			});
		default:
			console.log("WARNING: default case encountered for action: %O", action);
			return store;
	}
}

