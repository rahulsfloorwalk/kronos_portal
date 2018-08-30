import $ from "jquery";
import { url } from "../../../config";
import types from "../action_types.js";

import { fetchAudit } from "./audit.js";

export function fetchApplications(){
	return function(dispatch){
		dispatch({
			type: types.APPLICATION_GET,
			status: "request",
		});

		$.get( url.api_base_path + "auditor/application", function(applications){
			dispatch({
				type: types.APPLICATION_GET,
				status: "success",
				applications: applications,
			});
		});
		//TODO: Handle error
	};
}

export function loadAuditApplyForm( auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLY_FORM_LOAD,
			status: "request",
			auditId
		});

		var auditPromise = dispatch(fetchAudit(auditId));

		auditPromise.done(function(audit){
			dispatch({
				type: types.AUDIT_APPLY_FORM_LOAD,
				status: "success",
				auditId,
				audit
			});
		});
		return auditPromise;
	};
}

export function submitAuditApplyForm( auditApplication){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_APPLY_FORM_SUB,
			status: "request",
			auditApplication: auditApplication
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit/${auditApplication.audit_id}/application/apply`,
			data: JSON.stringify(auditApplication),
			contentType: "application/json"
		});
		req.done(function(savedApplication){
			dispatch({
				type: types.AUDIT_APPLY_FORM_SUB,
				status: "success",
				auditApplication: savedApplication
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_APPLY_FORM_SUB,
				status: "error",
				errors: error.responseJSON
			});
		});

		return req;
	};
}

export function loadAuditCancelForm( auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CANCEL_FORM_LOAD,
			status: "request",
			auditId
		});

		var auditPromise = dispatch(fetchAudit(auditId));

		auditPromise.done(function(audit){
			dispatch({
				type: types.AUDIT_CANCEL_FORM_LOAD,
				status: "success",
				auditId,
				audit,
			});
		});
	};
}

export function submitAuditCancelForm( auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CANCEL_FORM_SUB,
			status: "request",
			auditId: auditId,
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `auditor/audit/${auditId}/application/cancel`,
			contentType: "application/json"
		});
		req.done(function(savedApplication){
			dispatch({
				type: types.AUDIT_CANCEL_FORM_SUB,
				status: "success",
				auditApplication: savedApplication
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_CANCEL_FORM_SUB,
				status: "error",
				errors: error.responseJSON || { }
			});
		});

		return req;
	};
}
