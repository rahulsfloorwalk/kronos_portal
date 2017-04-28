import types from './manager/action_types.js'

var initialStore = {
	applications: {},
	audits: {},
	auditStores: {},
	auditCycles: {},
	clients: {},
	stores: {},
	sections: {},
	auditors: {},
	locations: {},
	states: {},
	cities: [],
	profileInfos: {},
	bankInfos: {},
	additionalInfos: {},
	answers: {},
	reportSections: {},
	clientUsers: {},
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
		section: {
			errors: {},
		},
		clientUser: {
			errors: {},
		},
	}
};

export function rootReducer(store = initialStore, action) {
	switch(action.type){
		/*Client Reducers */
		case types.CLIENT_GET:
			switch (action.status) {
				case 'request':
					break;
				case 'success':
					return Object.assign({}, store, {
						clients: (function(clients){
							var clientObj = {};
							for( var c of clients){
								clientObj[c.id] = c;
							}
							return clientObj;
						}(action.clients))
					});
					break;
				case 'error':
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}

		case types.CLIENT_POST:
			switch (action.status) {
				case 'request':
					break;
				case 'success':
					return Object.assign({}, store, {
						clients: Object.assign({}, store.clients, {
							[action.client.id]: action.client
						})
					});
					break;
				case 'error':
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							client: Object.assign({}, store.forms.client, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}

		case types.CLIENT_ID_GET:
			switch (action.status) {
				case 'request':
					break;
				case 'success':
					return Object.assign({}, store, {
						clients: Object.assign({}, store.clients, {
							[action.client.id]: action.client
						})
					});
					break;
				case 'error':
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}

		case types.CLIENT_ID_POST:
			switch (action.status) {
				case 'request':
					break;
				case 'success':
					return Object.assign({}, store, {
						clients: Object.assign({}, store.clients, {
							[action.client.id]: action.client
						})
					});
					break;
				case 'error':
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							client: Object.assign({}, store.forms.client, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
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
		case types.AUDITOR_ID_ACTIVATE:
		case types.AUDITOR_ID_DEACTIVATE:
		case types.AUDITOR_ID_VERIFY:
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
								audits: Object.assign({}, store.audits, {
									[action.audit.id]: action.audit
								})
							});
							break;
						default:
							console.warn("WARNING: default case encountered for action: %O", action);
					}
				case types.AUDIT_POST:
					switch(action.status){
						case "request":
							return Object.assign({}, store, {
								forms: Object.assign({}, store.forms, {
									audit: Object.assign({}, store.forms.audit, {
										errors: {}
									})
								})
							});
							break;
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
						case "request":
							return Object.assign({}, store, {
								forms: Object.assign({}, store.forms, {
									audit: Object.assign({}, store.forms.audit, {
										errors: {}
									})
								})
							});
							break;
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
			case types.AUDIT_STORE_GET:
				switch(action.status){
					case "success":
						return Object.assign({}, store, {
							auditStores: (function(auditStores){
								var obj = {};
								for( var a of auditStores){
									obj[a.id] = a;
								}
								return obj;
							}(action.auditStores))
						});
						break;
					default:
						console.warn("WARNING: default case encountered for action: %O", action);
						return store;
				}
		case types.AUDIT_STORE_ID_GET:
		case types.AUDIT_STORE_ID_UN_SUBMIT:
		case types.AUDIT_STORE_ID_SUBMIT:
		case types.AUDIT_STORE_ID_COMPLETE:
		case types.AUDIT_STORE_ID_UNCOMPLETE:
		case types.AUDIT_STORE_ID_FAIL:
		case types.AUDIT_STORE_ID_WITHDRAW:
		case types.AUDIT_STORE_UPDATED:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						errors: {}
					});
					break;
				case "success":
					return Object.assign({}, store, {
						auditStores: Object.assign({}, store.auditStores, {
							[action.auditStore.id]: action.auditStore
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
		case types.SECTION_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						sections: (function(sections){
							var obj = {};
							for( var s of sections){
								obj[s.id] = s;
							}
							return obj;
						}(action.sections))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.SECTION_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						sections: Object.assign({}, store.sections, {
							[action.section.id]: action.section
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.SECTION_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						sections: Object.assign({}, store.sections, {
							[action.section.id]: action.section
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							store: Object.assign({}, store.forms.section, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.SECTION_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						sections: Object.assign({}, store.sections, {
							[action.section.id]: action.section
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
		case types.ANSWER_GET:
			switch(action.status){
				case "request":
					return Object.assign({}, store, {
						answers: {}
					});
					break;
				case "success":
					return Object.assign({}, store, {
						answers: (function(answers){
							var obj = {};
							for( var a of answers){
								obj[a.id] = a;
							}
							return obj;
						}(action.answers))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.ANSWER_MARK:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						answers: Object.assign({}, store.answers, {
							[action.answer.id]: action.answer
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.REPORT_SECTION_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						reportSections: (function(reportSections){
							var obj = {};
							for( var r of reportSections){
								obj[r.id] = r;
							}
							return obj;
						}(action.reportSections))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.REPORT_SECTION_PM_COMMENT:
		case types.REPORT_SECTION_AUDITOR_COMMENT:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						reportSections: Object.assign({}, store.reportSections, {
							[action.reportSection.id]: action.reportSection
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
						cities: []
					});
				case "success":
					return Object.assign({}, store, {
						cities: action.cities
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CLIENT_USER_FORM_LOAD:
			switch(action.status){
				case "request":
				case "success":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							clientUser: Object.assign({}, store.forms.clientUser, {
								errors: {}
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CLIENT_USER_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						clientUsers: (function(clientUsers){
							var obj = {};
							for( var c of clientUsers){
								obj[c.id] = c;
							}
							return obj;
						}(action.clientUsers))
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CLIENT_USER_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						clientUsers: Object.assign({}, store.clientUsers, {
							[action.clientUser.id]: action.clientUser
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							clientUser: Object.assign({}, store.forms.clientUser, {
								errors: action.errors
							})
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CLIENT_USER_ID_GET:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						clientUsers: Object.assign({}, store.clientUsers, {
							[action.clientUser.id]: action.clientUser
						})
					});
					break;
				default:
					console.warn("WARNING: default case encountered for action: %O", action);
					return store;
			}
		case types.CLIENT_USER_ID_POST:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						clientUsers: Object.assign({}, store.clientUsers, {
							[action.clientUser.id]: action.clientUser
						})
					});
					break;
				case "error":
					return Object.assign({}, store, {
						forms: Object.assign({}, store.forms, {
							clientUser: Object.assign({}, store.forms.clientUser, {
								errors: action.errors
							})
						})
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
		case types.AUDIT_APPLICATION_APPROVE:
		case types.AUDIT_APPLICATION_REJECT:
			switch(action.status){
				case "success":
					return Object.assign({}, store, {
						audits: Object.assign({}, store.audits, {
							[action.application.audit]: Object.assign({}, store.audits[action.application.audit], {
								applications: store.audits[action.application.audit].applications.map((app, i, applications) => app.id === action.application.id ? action.application : app)
							})
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
