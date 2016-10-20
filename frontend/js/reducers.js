import { types } from './actions'

var initialStore = {
	profileInfo: {},
	bankInfo: {},
	additionalInfo: {},
	clients: {},
	auditors: {},
	profileInfos: {},
	bankInfos: {},
	additionalInfos: {},
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
		client: {
			initialValues:{},
			errors: {}
		}
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
		/*Client Reducers */
		case types.CLIENT_GET_SUC:
			return Object.assign({}, store, {
				clients: (function(clients){
					var clientObj = {};
					for( var c of clients){
						clientObj[c.id] = c;
					}
					return clientObj;
				}(action.clients))
			});
		case types.CLIENT_POST_SUC:
			return Object.assign({}, store, {
				clients: Object.assign({}, store.clients, {
					[action.client.id]: action.client
				})
			});
		case types.CLIENT_ID_GET_SUC:
			return Object.assign({}, store, {
				clients: Object.assign({}, store.clients, {
					[action.client.id]: action.client
				})
			});
		case types.CLIENT_ID_POST_SUC:
			return Object.assign({}, store, {
				clients: Object.assign({}, store.clients, {
					[action.client.id]: action.client
				})
			});
		case types.CLIENT_FORM_LOAD_REQ:
			var iVal = {};
			if( action.clientId){
				iVal = store.clients[action.clientId];
			}
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					client: {
						initialValues: iVal,
						errors: {}
					}
				})
			});
		case types.CLIENT_FORM_LOAD_SUC:
			var iVal = {};
			if( action.clientId){
				iVal = store.clients[action.clientId];
			}
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					client: {
						initialValues: iVal,
						errors: {}
					}
				})
			});
		/*Auditor Get Request*/
		case types.AUDITOR_GET_SUC:
			return Object.assign({}, store, {
				auditors: (function(auditors){
					var obj = {};
					for( var a of auditors){
						obj[a.id] = a;
					}
					return obj;
				}(action.auditors))
			});
		case types.AUDITOR_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						auditors: Object.assign({}, store.auditors, {
							[action.auditor.id]: action.auditor
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDITOR_GET_PROFILE_INFO:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						profileInfos: Object.assign({}, store.profileInfos, {
							[action.profileInfo.user_id]: action.profileInfo
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDITOR_GET_BANK_INFO:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						bankInfos: Object.assign({}, store.bankInfos, {
							[action.bankInfo.user_id]: action.bankInfo
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDITOR_GET_ADDITIONAL_INFO:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						additionalInfos: Object.assign({}, store.additionalInfos, {
							[action.additionalInfo.user_id]: action.additionalInfo
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		default:
			console.warn("WARNING: default case encountered for action: %O", action);
			return store;
	}
}

