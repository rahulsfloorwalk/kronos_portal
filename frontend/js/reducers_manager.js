import { types } from './manager_actions.js'

var initialStore = {
	audits: {},
	clients: {},
	auditors: {},
	locations: {},
	cities: {},
	profileInfos: {},
	bankInfos: {},
	additionalInfos: {},
	forms: {
		client: {
			initialValues:{},
			errors: {}
		},
		location: {
			initialValues:{},
			errors: {}
		},
		audit: {
			errors: {}
		}
	}
};

export function rootReducer(store = initialStore, action) {
	switch(action.type){
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
		case types.LOCATION_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						locations: (function(locations){
							var obj = {};
							for( var l of locations){
								obj[l.id] = l;
							}
							return obj;
						}(action.locations))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.LOCATION_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						locations: Object.assign({}, store.locations, {
							[action.location.id]: action.location
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							location: Object.assign({}, store.forms.location, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.LOCATION_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						locations: Object.assign({}, store.locations, {
							[action.location.id]: action.location
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.LOCATION_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						locations: Object.assign({}, store.locations, {
							[action.location.id]: action.location
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							location: Object.assign({}, store.forms.location, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CITY_GET:
			switch(action.status){
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
		case types.AUDIT_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.audit.id]: action.audit
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							audit: Object.assign({}, store.forms.audit, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.audit.id]: action.audit
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							audit: Object.assign({}, store.forms.audit, {
								errors: action.errors
							})
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

