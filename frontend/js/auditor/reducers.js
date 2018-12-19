import types from "./action_types.js";

var initialStore = {
	user: {},
	profileInfo: {},
	bankInfo: {},
	additionalInfo: {},
	socialInfo: {},
	audits: {},
	auditStores: {},
	states: {},
	cities: [],
	sections: {},
	answers: {},
	reportSections: {},
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
	/*User Reducers */
	case types.USER_GET:
		switch (action.status) {
		case "success":
			return Object.assign({}, store, {
				user: action.user
			});
		}
		break;
		/*Dashboard Reducers */
	case types.AUDITOR_STATS_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingAuditorStats: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingAuditorStats: false,
				auditorStats: Object.assign({}, store.auditorStats, action.auditorStats)
			});
		case "error":
			break;

		}
		break;
	case types.AUDITOR_SCORE_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingAuditorScore: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingAuditorScore: false,
				auditorScore: Object.assign({}, store.auditorScore, action.auditorScore)
			});
		case "error":

		}

		break;
		/*Profile Info Reducers */
	case types.PROFILE_INFO_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingProfileInfo: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingProfileInfo: false,
				profileInfo: Object.assign({}, store.profileInfo, action.profileInfo)
			});
		case "error":
			break;

		}

		break;
	case types.PROFILE_INFO_POST:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					profileInfo:{
						errors: {}
					}
				})
			});
		case "success":
			return Object.assign({}, store, {
				profileInfo: action.profileInfo,
				forms: Object.assign({}, store.forms, {
					profileInfo: Object.assign({}, store.forms.profileInfo, {
						errors: {}
					})
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					profileInfo: Object.assign({}, store.forms.profileInfo, {
						errors: action.errors
					})
				})
			});
		}

		break;
		/*Bank Info Reducers */
	case types.BANK_INFO_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingBankInfo: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingBankInfo: false,
				bankInfo: Object.assign({}, store.bankInfo, action.bankInfo)
			});
		case "error":
			break;
		}

		break;
	case types.BANK_INFO_POST:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					bankInfo:{
						errors: {}
					}
				})
			});
		case "success":
			return Object.assign({}, store, {
				bankInfo: action.bankInfo,
				forms: Object.assign({}, store.forms, {
					bankInfo: Object.assign({}, store.forms.bankInfo, {
						errors: {}
					})
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					bankInfo: Object.assign({}, store.forms.bankInfo, {
						errors: action.errors
					})
				})
			});
		}

		break;
		/*Additional Info Reducers */
	case types.ADDITIONAL_INFO_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingAdditionalInfo: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingAdditionalInfo: false,
				additionalInfo: Object.assign({}, store.additionalInfo, action.additionalInfo)
			});
		case "error":
			break;
		}

		break;
	case types.ADDITIONAL_INFO_POST:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					additionalInfo:{
						errors: {}
					}
				})
			});
		case "success":
			return Object.assign({}, store, {
				additionalInfo: action.additionalInfo,
				forms: Object.assign({}, store.forms, {
					additionalInfo: Object.assign({}, store.forms.additionalInfo, {
						errors: {}
					})
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					additionalInfo: Object.assign({}, store.forms.additionalInfo, {
						errors: action.errors
					})
				})
			});
		}

		break;
		/*Social Info Reducers */
	case types.SOCIAL_INFO_GET:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				loadingSocialInfo: true
			});
		case "success":
			return Object.assign({}, store, {
				loadingSocialInfo: false,
				socialInfo: Object.assign({}, store.socialInfo, action.socialInfo)
			});
		case "error":
			break;
		}

		break;
	case types.SOCIAL_INFO_POST:
		switch (action.status) {
		case "request":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					socialInfo:{
						errors: {}
					}
				})
			});
		case "success":
			return Object.assign({}, store, {
				socialInfo: action.socialInfo,
				forms: Object.assign({}, store.forms, {
					socialInfo: Object.assign({}, store.forms.socialInfo, {
						errors: {}
					})
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					socialInfo: Object.assign({}, store.forms.socialInfo, {
						errors: action.errors
					})
				})
			});
		}

		break;
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
		}
		break;
	case types.AUDIT_ID_GET:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				audits: Object.assign({}, store.audits, {
					[action.audit.id]: action.audit
				})
			});
		}
		break;
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
		}
		break;
	case types.AUDIT_APPLY_FORM_SUB:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				applications: Object.assign({}, store.applications, {
					[action.auditApplication.id]: action.auditApplication
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					auditApply:{
						errors: action.errors
					}
				})
			});
		}
		break;
	case types.APPLICATION_GET:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				applications: (function(applications){
					var obj = {};
					for( var a of applications){
						obj[a.id] = a;
					}
					return obj;
				}(action.applications))
			});
		}
		break;
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
		}
		break;
	case types.AUDIT_CANCEL_FORM_SUB:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				applications: Object.assign({}, store.applications, {
					[action.auditApplication.id]: action.auditApplication
				})
			});
		case "error":
			return Object.assign({}, store, {
				forms: Object.assign({}, store.forms, {
					auditCancel:{
						errors: action.errors
					}
				})
			});
		}
		break;
	case types.AUDIT_STORE_GET:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				auditStores: (function(auditStores){
					var obj = {};
					for( var as of auditStores){
						obj[as.id] = as;
					}
					return obj;
				}(action.auditStores))
			});
		}
		break;
	case types.AUDIT_STORE_ID_GET:
	case types.AUDIT_STORE_ID_SUBMIT:
	case types.AUDIT_STORE_ID_ACKNOWLEDGE:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				auditStores: Object.assign({}, store.auditStores, {
					[action.auditStore.id]: action.auditStore
				})
			});
		}
		break;
	case types.STATE_GET:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				states: action.states
			});
		}
		break;
	case types.SECTION_GET:
		switch(action.status){
		case "request":
			return Object.assign({}, store, {
				sections: {}
			});
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
		}
		break;
	case types.ANSWER_GET:
		switch(action.status){
		case "request":
			return Object.assign({}, store, {
				answers: {}
			});
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
		}
		break;
	case types.ANSWER_POST:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				answers: Object.assign({}, store.answers, {
					[action.answer.id]: action.answer
				})
			});
		}
		break;
	case types.REPORT_SUMMARY_POST:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				auditStores: Object.assign({}, store.auditStores, {
					[action.auditStore.id]: action.auditStore
				})
			});
		}
		break;
	case types.REPORT_SECTION_GET:
		switch(action.status){
		case "request":
			return Object.assign({}, store, {
				reportSections: {}
			});
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
		}
		break;
	case types.REPORT_SECTION_COMMENT:
		switch(action.status){
		case "success":
			return Object.assign({}, store, {
				reportSections: Object.assign({}, store.reportSections, {
					[action.reportSection.id]: action.reportSection
				})
			});
		}
		break;
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
		}
	}
	console.warn("WARNING: default case encountered for action: %O", action);
	return store;
}
