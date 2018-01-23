import $ from 'jquery'
import { url } from '../../../config.js'
import types from '../action_types.js';
import { hashHistory } from 'react-router';

import { fetchAuditCyclesByClient } from '../service/audit_cycle.js';

export function fetchAuditCycles(clientId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_GET,
			status: 'request',
			clientId
		});

		return fetchAuditCyclesByClient(clientId).done(function(auditCycles){
			dispatch({
				type: types.AUDIT_CYCLE_GET,
				status: 'success',
				auditCycles
			});
		});
		//TODO: Handle error
	};
};

export function fetchAuditCycle(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_ID_GET,
			status: 'request',
			auditCycleId
		});

		return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}`, function(auditCycle){
			dispatch({
				type: types.AUDIT_CYCLE_ID_GET,
				status: 'success',
				auditCycle
			});
		});
		//TODO: Handle error
	};
};

export function loadAuditCycleAddForm(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadAuditCycleEditForm(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_FORM_LOAD,
			status: 'request',
			auditCycleId
		});
		return dispatch(fetchAuditCycle(auditCycleId));
	};
};

export function saveAuditCycleAddForm(auditCycle){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_FORM_SUB,
			status: 'request',
			auditCycle

		});
		dispatch({
			type: types.AUDIT_CYCLE_POST,
			status: 'request',
			auditCycle
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/audit_cycle",
			data: JSON.stringify(auditCycle),
			contentType: "application/json"
		});
		req.done(function(savedAuditCycle){
			dispatch({
				type: types.AUDIT_CYCLE_POST,
				status: 'success',
				auditCycle: savedAuditCycle
			});
			dispatch({
				type: types.AUDIT_CYCLE_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_CYCLE_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_CYCLE_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function saveAuditCycleEditForm(auditCycle){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_CYCLE_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.AUDIT_CYCLE_ID_POST,
			status: 'request',
			audit: auditCycle
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_cycle/${auditCycle.id}`,
			data: JSON.stringify(auditCycle),
			contentType: "application/json"
		});
		req.done(function(savedAuditCycle){
			dispatch({
				type: types.AUDIT_CYCLE_ID_POST,
				status: 'success',
				auditCycle: savedAuditCycle
			});
			dispatch({
				type: types.AUDIT_CYCLE_FORM_SUB,
				status: 'success'
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_CYCLE_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_CYCLE_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function setPostApprovalDescription(auditCycleId, postApprovalDescription){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_cycle/${auditCycleId}/post_approval_description`,
			data: JSON.stringify({
				post_approval_description: postApprovalDescription
			}),
			contentType: "application/json"
		});
		req.done(function(savedAuditCycle){
			dispatch({
				type: types.AUDIT_CYCLE_ID_POST,
				status: 'success',
				auditCycle: savedAuditCycle
			});
		});
		return req;
	};
}

//code for audits here

export function hideAudit(audit_id){
	return function(dispatch){
		let req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit/${audit_id}/hidden`,
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: "success",
				audit: savedAudit
			});
		});
		return req;
	};
}

export function unhideAudit(audit_id){
	return function(dispatch){
		let req = $.ajax({
			type: "DELETE",
			url: url.api_base_path + `manager/audit/${audit_id}/hidden`,
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: "success",
				audit: savedAudit
			});
		});
		return req;
	};
}

export function fetchAudits(auditCycleId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_GET,
			status: 'request',
			auditCycleId
		});

		return $.get( url.api_base_path + `manager/audit_cycle/${auditCycleId}/audit`, function(audits){
			dispatch({
				type: types.AUDIT_GET,
				status: 'success',
				audits
			});
		});
		//TODO: Handle error
	};
};

export function fetchAudit(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_ID_GET,
			status: 'request',
			auditId
		});

		return $.get( url.api_base_path + `manager/audit/${auditId}`, function(audit){
			dispatch({
				type: types.AUDIT_ID_GET,
				status: 'success',
				audit
			});
		});
		//TODO: Handle error
	};
};

export function loadAuditAddForm(){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_LOAD,
			status: 'success'
		});
	};
};

export function loadAuditEditForm(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_LOAD,
			status: 'request',
			auditId
		});
		return dispatch(fetchAudit(auditId));
	};
};

export function saveAuditAddForm(audit){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_SUB,
			status: 'request',
			audit

		});
		dispatch({
			type: types.AUDIT_POST,
			status: 'request',
			audit
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + "manager/audit",
			data: JSON.stringify(audit),
			contentType: "application/json"
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_POST,
				status: 'success',
				audit: savedAudit
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'success',
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function saveAuditEditForm(audit){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_FORM_SUB,
			status: 'request'
		});
		dispatch({
			type: types.AUDIT_ID_POST,
			status: 'request',
			audit: audit
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit/${audit.id}`,
			data: JSON.stringify(audit),
			contentType: "application/json"
		});
		req.done(function(savedAudit){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: 'success',
				audit: savedAudit
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'success'
			});
		});
		req.fail(function(error){
			dispatch({
				type: types.AUDIT_ID_POST,
				status: 'error',
				errors: error.responseJSON
			});
			dispatch({
				type: types.AUDIT_FORM_SUB,
				status: 'error',
			});
		});
		return req;
	};
};

export function deleteAudit(auditId){
	return function(dispatch){
		dispatch({
			type: types.AUDIT_ID_DELETE,
			status: 'request',
			auditId,
		});
		let req = $.ajax({
			url: url.api_base_path + `manager/audit/${auditId}`,
			type: "DELETE"
		});
		req.done(function(){
			dispatch({
				type: types.AUDIT_ID_DELETE,
				status: 'success',
				auditId,
			});
		});
		req.fail(function(){
			dispatch({
				type: types.AUDIT_ID_DELETE,
				status: 'error',
				auditId,
			});
		});
		return req;
	};
};

