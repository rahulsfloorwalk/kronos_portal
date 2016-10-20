import { types } from './auditor_actions.js'

var initialStore = {
	profileInfo: {},
	bankInfo: {},
	additionalInfo: {},
	forms: {
		profileInfo: {
			errors:{}
		},
		additionalInfo: {
			errors:{}
		},
		bankInfo: {
			errors:{}
		},
	}
};

export function rootReducer(store = initialStore, action) {
	switch(action.type){
		/*Profile Info Reducers */
		case types.PROFILE_INFO_GET_REQ:
			return Object.assign({}, store, {
				loadingProfileInfo: true
			});
		case types.PROFILE_INFO_GET_SUC:
			return Object.assign({}, store, {
				loadingProfileInfo: false,
				profileInfo: Object.assign({}, store.profileInfo, action.profileInfo)
			});
		case types.PROFILE_INFO_POST_REQ:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					profileInfo:{
						errors: {}
					}
				})
			});
		case types.PROFILE_INFO_POST_SUC:
			return Object.assign({}, store, {
				profileInfo: action.profileInfo,
				forms: Object.assign({}, store.forms, {
					profileInfo: Object.assign({}, store.forms.profileInfo, {
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
		/*Bank Info Reducers */
		case types.BANK_INFO_GET_REQ:
			return Object.assign({}, store, {
				loadingBankInfo: true
			});
		case types.BANK_INFO_GET_SUC:
			return Object.assign({}, store, {
				loadingBankInfo: false,
				bankInfo: Object.assign({}, store.bankInfo, action.bankInfo)
			});
		case types.BANK_INFO_POST_REQ:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					bankInfo:{
						errors: {}
					}
				})
			});
		case types.BANK_INFO_POST_SUC:
			return Object.assign({}, store, {
				bankInfo: action.bankInfo,
				forms: Object.assign({}, store.forms, {
					bankInfo: Object.assign({}, store.forms.bankInfo, {
						errors: {}
					})
				})
			});
		case types.BANK_INFO_POST_ERR:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					bankInfo: Object.assign({}, store.forms.bankInfo, {
						errors: action.errors
					})
				})
			});
		/*Additional Info Reducers */
		case types.ADDITIONAL_INFO_GET_REQ:
			return Object.assign({}, store, {
				loadingAdditionalInfo: true
			});
		case types.ADDITIONAL_INFO_GET_SUC:
			return Object.assign({}, store, {
				loadingAdditionalInfo: false,
				additionalInfo: Object.assign({}, store.additionalInfo, action.additionalInfo)
			});
		case types.ADDITIONAL_INFO_POST_REQ:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					additionalInfo:{
						errors: {}
					}
				})
			});
		case types.ADDITIONAL_INFO_POST_SUC:
			return Object.assign({}, store, {
				additionalInfo: action.additionalInfo,
				forms: Object.assign({}, store.forms, {
					additionalInfo: Object.assign({}, store.forms.additionalInfo, {
						errors: {}
					})
				})
			});
		case types.ADDITIONAL_INFO_POST_ERR:
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					additionalInfo: Object.assign({}, store.forms.additionalInfo, {
						errors: action.errors
					})
				})
			});
		default:
			console.warn("WARNING: default case encountered for action: %O", action);
			return store;
	}
}

