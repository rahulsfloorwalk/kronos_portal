import types from './auditor/action_types.js'

var initialStore = {
	profileInfo: {},
	bankInfo: {},
	additionalInfo: {},
	audits: {},
	states: {},
	cities: {},
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
		auditApply: {
			errors: {}
		},
		auditCancel: {
			errors: {}
		}
	},
	applications:{}
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
		case types.AUDIT_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: (function(audits){
							var obj = {};
							for( var a of audits){
								obj[a.id] = a;
							}
							return obj;
						}(action.audits))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.audit.id]: action.audit
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_APPLY_FORM_LOAD:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditApply:{
								errors: {}
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_APPLY_FORM_SUB:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						applications: Object.assign({}, store.applications, {
							[action.auditApplication.id]: action.auditApplication
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditApply:{
								errors: action.errors
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_ID_GET_APPLICATIONS:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						applications: Object.assign({}, store.applications, (function(applications){
							var obj = {};
							for( var a of applications){
								obj[a.id] = a;
							}
							return obj;
						}(action.applications)))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_CANCEL_FORM_LOAD:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditCancel:{
								errors: {}
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_CANCEL_FORM_SUB:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						applications: Object.assign({}, store.applications, {
							[action.auditApplication.id]: action.auditApplication
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditCancel:{
								errors: action.errors
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.STATE_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						states: action.states
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CITY_GET:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						cities: {}
					});
				case "success":
					return Object.assign({}, store, {
						cities: (function(cities){
							var obj = {};
							for( var c of cities){
								obj[c.id] = c;
							}
							return obj;
						}(action.cities))
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
