import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

export function fetchAuditStores(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_GET,
			status: "request",
		});

		return $.get( url.api_base_path + "auditor/audit_store", function(auditStores){
			dispatch({
				type: types.AUDIT_STORE_GET,
				status: "success",
				auditStores
			});
		});
		//TODO: Handle error
	};
}

export function fetchAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_GET,
			status: "request",
			auditStoreId
		});

		return $.get( url.api_base_path + `auditor/audit_store/${auditStoreId}`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_GET,
				status: "success",
				auditStore
			});
		});
		//TODO: Handle error
	};
}

export function acknowledgeAuditStore(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_STORE_ID_ACKNOWLEDGE,
			status: "request",
			auditStoreId
		});

		return $.post( url.api_base_path + `auditor/audit_store/${auditStoreId}/acknowledge`, function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_ACKNOWLEDGE,
				status: "success",
				auditStore
			});
		});
		//TODO: Handle error
	};
}

// export function submitAuditStore(auditStoreId){
// 	return function(dispatch){
// 		dispatch({
// 			type: types.AUDIT_STORE_ID_SUBMIT,
// 			status: "request",
// 			auditStoreId
// 		});

// 		return $.post( url.api_base_path + `auditor/audit_store/${auditStoreId}/submit`, function(auditStore){
// 			dispatch({
// 				type: types.AUDIT_STORE_ID_SUBMIT,
// 				status: "success",
// 				auditStore
// 			});
// 		});
// 		//TODO: Handle error
// 	};
// }

export function submitAuditStore(auditStoreId, reportSubmissionTime) {
	return function (dispatch) {
		dispatch({
			type: types.AUDIT_STORE_ID_SUBMIT,
			status: "request",
			auditStoreId,
		});

		return $.ajax({
			url:  url.api_base_path + `auditor/audit_store/${auditStoreId}/submit`,
			type: "POST",
			data: JSON.stringify({ report_submission_time: reportSubmissionTime }),
			contentType: "application/json",
			dataType: "json",
		})
			.then((auditStore) => {
				dispatch({
					type: types.AUDIT_STORE_ID_SUBMIT,
					status: "success",
					auditStore,
				});
				return auditStore;
			})
			.fail((error) => {
				dispatch({
					type: types.AUDIT_STORE_ID_SUBMIT,
					status: "error",
					error,
				});
				throw error;
			});
	};
}
export function logoutTimer(payload){
	return $.ajax({
		url: url.api_base_path + "auditor/audit_store/report_submission_time",
		method: "POST",
		data: JSON.stringify(payload),
		contentType: "application/json"
	});
}

export function withdrawAuditStore(auditStoreId, message){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit_store/${auditStoreId}/withdraw`,
			data: JSON.stringify({
				message
			}),
			contentType: "application/json"
		});
		req.done(function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_WITDRAW,
				status: "success",
				auditStore,
			});
		});
		//TODO: Handle error
		return req;
	};
}


export function failAuditStore(auditStoreId, message){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit_store/${auditStoreId}/fail`,
			data: JSON.stringify({
				message
			}),
			contentType: "application/json"
		});
		req.done(function(auditStore){
			dispatch({
				type: types.AUDIT_STORE_ID_FAIL,
				status: "success",
				auditStore,
			});
		});
		//TODO: Handle error
		return req;
	};
}

export function submitReportSummary(audit_store_id, report_summary){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit_store/${audit_store_id}/report_summary`,
			data: JSON.stringify({
				report_summary
			}),
			contentType: "application/json"
		});
		req.done(function(auditStore){
			dispatch({
				type: types.REPORT_SUMMARY_POST,
				status: "success",
				auditStore,
			});
		});
		//TODO: Handle error
		return req;
	};
}

export function submitNpsSection(audit_store_id, nps_section){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit_store/${audit_store_id}/nps_section`,
			data: JSON.stringify({
				nps_section
			}),
			contentType: "application/json"
		});
		req.done(function(auditStore){
			dispatch({
				type: types.NPS_SECTION_POST,
				status: "success",
				auditStore,
			});
		});
		//TODO: Handle error
		return req;
	};
}

export function submitConcern(auditStoreId, message){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit_store/${auditStoreId}/report_concern`,
			data: JSON.stringify({
				message
			}),
			contentType: "application/json"
		});
		req.done(function(auditStore){
			dispatch({
				type: types.REPORT_CONCERN_POST,
				status: "success",
				auditStore,
			});
		});
		return req;
	};
}

export function arrangeAttachment(auditStoreId){
	return $.post(url.api_base_path + `auditor/attachment/${auditStoreId}/arrange_attachment`);
}

export function FetchGuidlineByAuditStore(auditStoreId){
	return $.get(url.api_base_path + `auditor/audit_store/${auditStoreId}/guildline`);
}

export function FetchFeedbackByAuditStore(auditStoreId){
	return $.get(url.api_base_path + `auditor/audit_store/${auditStoreId}/report_feedback`);
}