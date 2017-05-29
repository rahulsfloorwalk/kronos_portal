import $ from 'jquery'
import { url } from '../../../config'
import types from '../action_types.js'

export function fetchReportSections(auditStoreId){
	return function(dispatch){
		dispatch({
			type: types.REPORT_SECTION_GET,
			status: 'request',
			auditStoreId
		});

		return $.get( url.api_base_path + `manager/audit_store/${auditStoreId}/report_section`, function(reportSections){
			dispatch({
				type: types.REPORT_SECTION_GET,
				status: 'success',
				reportSections
			});
		});
		//TODO: Handle error
	};
};

export function submitPMComment(reportSection){
	return function(dispatch){
		dispatch({
			type: types.REPORT_SECTION_PM_COMMENT,
			status: 'request',
			reportSection
		});

		var payload = {
			pm_comment: reportSection.pm_comment
		};
		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_store/${reportSection.audit_store}/section/${reportSection.sectionId}/comment`,
			data: JSON.stringify(payload),
			contentType: "application/json"
		});
		req.done(function(reportSection){
			dispatch({
				type: types.REPORT_SECTION_PM_COMMENT,
				status: 'success',
				reportSection
			});
		});
		//TODO: Handle error
		return req;
	};
};

export function submitAuditorComment(auditStoreId, sectionId, auditorComment){
	return function(dispatch){
		dispatch({
			type: types.REPORT_SECTION_AUDITOR_COMMENT,
			status: 'request',
			auditStoreId,
			sectionId,
			auditorComment,
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_store/${auditStoreId}/section/${sectionId}/auditor_comment`,
			data: JSON.stringify({
				auditor_comment: auditorComment
			}),
			contentType: "application/json"
		});
		req.done(function(reportSection){
			dispatch({
				type: types.REPORT_SECTION_AUDITOR_COMMENT,
				status: 'success',
				reportSection
			});
		});
		//TODO: Handle error
		return req;
	};
};

export function setNotApplicable(auditStoreId, sectionId, notApplicable){
	return function(dispatch){
		dispatch({
			type: types.REPORT_SECTION_NOT_APPLICABLE,
			status: 'request',
			auditStoreId,
			sectionId,
			notApplicable,
		});

		var req = $.ajax({
			type: "POST",
			url: url.api_base_path + `manager/audit_store/${auditStoreId}/section/${sectionId}/not_applicable`,
			data: JSON.stringify({
				not_applicable: notApplicable
			}),
			contentType: "application/json"
		});
		req.done(function(reportSection){
			dispatch({
				type: types.REPORT_SECTION_NOT_APPLICABLE,
				status: 'success',
				reportSection
			});
		});
		//TODO: Handle error
		return req;
	};
};
