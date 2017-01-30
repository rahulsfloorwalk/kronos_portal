import types from './manager/action_types.js'

var initialStore = {
	applications: {},
	audits: {},
	auditCycles: {},
	clients: {},
	stores: {},
	auditors: {},
	locations: {},
	states: {},
	cities: {},
	profileInfos: {},
	bankInfos: {},
	additionalInfos: {},
	errors: {},
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
		},
		auditCycle: {
			errors: {}
		},
		auditLocation: {
			errors: {}
		},
		applicationAssign: {
			errors: {}
		},
		applicationReject: {
			errors: {}
		},
		applicationComplete: {
			errors: {}
		},
		applicationFail: {
			errors: {}
		},
		auditorSearch: {
			search: "",
		},
		store: {
			errors: {},
		},
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
		/*Auditor Search Request*/
		case types.AUDITOR_SEARCH:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditorSearch: {
								search: action.search
							}
						})
					});
				case "success":
					return Object.assign({}, store, {
						auditors: (function(auditors){
							var obj = {};
								for( var a of auditors){
								obj[a.id] = a;
							}
							return obj;
						}(action.page.results))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
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
		case types.STORE_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						stores: (function(stores){
							var obj = {};
							for( var s of stores){
								obj[s.id] = s;
							}
							return obj;
						}(action.stores))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.STORE_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						stores: Object.assign({}, store.stores, {
							[action.store.id]: action.store
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.STORE_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						stores: Object.assign({}, store.stores, {
							[action.store.id]: action.store
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							store: Object.assign({}, store.forms.store, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.STORE_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						stores: Object.assign({}, store.stores, {
							[action.store.id]: action.store
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							store: Object.assign({}, store.forms.store, {
								errors: action.errors
							})
						})
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
								stores: Object.assign({}, store.audits, {
									[action.audit.id]: action.audit
								})
							});
							break;
						default:
							console.warn("WARNING: default case encountered for action: %O", action);
							return audit;
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
		case types.AUDIT_CYCLE_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						auditCycles: (function(auditCycles){
							var obj = {};
							for( var a of auditCycles){
								obj[a.id] = a;
							}
							return obj;
						}(action.auditCycles))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_CYCLE_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						auditCycles: Object.assign({}, store.auditCycles, {
							[action.auditCycle.id]: action.auditCycle
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditCycle: Object.assign({}, store.forms.auditCycle, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_CYCLE_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						auditCycles: Object.assign({}, store.auditCycles, {
							[action.auditCycle.id]: action.auditCycle
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_CYCLE_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						auditCycles: Object.assign({}, store.auditCycles, {
							[action.auditCycle.id]: action.auditCycle
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditCycle: Object.assign({}, store.forms.auditCycle, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_LOCATION_FORM_LOAD:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditLocation: {
								errors: {}
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_LOCATION_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.auditLocation.audit]: Object.assign({}, store.audits[action.auditLocation.audit], {
								auditlocations: (function(auditlocations){
									auditlocations.push(action.auditLocation);
									return auditlocations;
								}(store.audits[action.auditLocation.audit].auditlocations))
							})
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditLocation: {
								errors: action.errors
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_LOCATION_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.auditLocation.audit]: Object.assign({}, store.audits[action.auditLocation.audit], {
								auditlocations: (function(auditLocations){
									for( var id in auditLocations){
										if( auditLocations[id].id === action.auditLocation.id){
											console.debug("found match");
											auditLocations[id] = action.auditLocation;
										}
									}
									return auditLocations;
								}(store.audits[action.auditLocation.audit].auditlocations))
							})
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							auditLocation: {
								errors: action.errors
							}
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.AUDIT_APPLICATION_GET:
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
		case types.AUDIT_APPLICATION_ASSIGN:
		case types.AUDIT_APPLICATION_REJECT:
		case types.AUDIT_APPLICATION_COMPLETE:
		case types.AUDIT_APPLICATION_FAIL:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						applications: Object.assign({}, store.applications, {
							[action.application.id]: action.application
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						errors: action.errors
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
